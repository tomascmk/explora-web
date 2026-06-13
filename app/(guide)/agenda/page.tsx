'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar } from '@/components/agenda/Calendar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { format } from 'date-fns';
import { Plus, Clock, MapPin, X, Pencil, Trash2, CalendarDays, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  GET_USER_SCHEDULES_BY_USER,
  CREATE_MY_USER_SCHEDULE,
  UPDATE_USER_SCHEDULE,
  REMOVE_USER_SCHEDULE,
} from '@/graphql/agenda';
import { GET_TOURS_BY_GUIDE } from '@/graphql/tours';
import { getDisplayError } from '@/utils/errorMessages';

interface TourOption {
  id: string;
  title: string;
}

interface UserScheduleRow {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime?: string | null;
  type?: string | null;
  location?: string | null;
  isConfirmed?: boolean;
  user: { id: string };
  tour?: TourOption | null;
}

function mapToCalendarEvents(schedules: UserScheduleRow[] | undefined) {
  if (!schedules) return [];
  return schedules.map((s) => ({
    id: s.id,
    date: new Date(s.startTime),
    title: s.title,
    type: (s.type === 'reservation' ? 'reservation' : 'availability') as 'availability' | 'reservation',
    status: s.isConfirmed ? 'CONFIRMED' : undefined,
  }));
}

export default function AgendaPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<UserScheduleRow | null>(null);
  const [deleteModalConfig, setDeleteModalConfig] = useState<{ isOpen: boolean; eventId: string; title: string }>({
    isOpen: false,
    eventId: '',
    title: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [startTimeValue, setStartTimeValue] = useState('09:00');
  const [endTimeValue, setEndTimeValue] = useState('10:00');
  const [endTouched, setEndTouched] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Helper: add 1 hour to a HH:mm string, capping at 23:59
  const addOneHour = (time: string): string => {
    const [hStr, mStr] = time.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (Number.isNaN(h) || Number.isNaN(m)) return time;
    const nextH = h + 1;
    if (nextH >= 24) return '23:59';
    return `${String(nextH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Sync time state when modal opens or editing target changes
  useEffect(() => {
    if (!showModal) return;
    if (editingEvent) {
      const start = format(new Date(editingEvent.startTime), 'HH:mm');
      const end = editingEvent.endTime
        ? format(new Date(editingEvent.endTime), 'HH:mm')
        : addOneHour(start);
      setStartTimeValue(start);
      setEndTimeValue(end);
      setEndTouched(true); // when editing, treat existing end time as user-set
    } else {
      setStartTimeValue('09:00');
      setEndTimeValue('10:00');
      setEndTouched(false);
    }
  }, [showModal, editingEvent]);

  const { data, loading, error, refetch } = useQuery<{ userSchedulesByUser: UserScheduleRow[] }>(
    GET_USER_SCHEDULES_BY_USER,
    {
      variables: { userId: user?.id ?? '' },
      skip: !user?.id,
    }
  );

  const { data: toursData } = useQuery<{ toursByGuide: TourOption[] }>(
    GET_TOURS_BY_GUIDE,
    {
      variables: { guideId: user?.id ?? '' },
      skip: !user?.id,
    }
  );

  const guideTours = toursData?.toursByGuide || [];

  // We manipulate the Apollo cache directly instead of refetching after each
  // mutation. Reason: the outer `if (loading) return <spinner/>` would unmount
  // the calendar on every CRUD if `notifyOnNetworkStatusChange` is ever flipped
  // on — the same anti-pattern that caused the dashboard filter reset bug.
  const [createMyUserSchedule, { loading: creating }] = useMutation(CREATE_MY_USER_SCHEDULE, {
    update: (cache, { data: mutationData }) => {
      const created = (mutationData as { createMyUserSchedule?: UserScheduleRow } | undefined)
        ?.createMyUserSchedule;
      if (!created || !user?.id) return;
      cache.updateQuery<{ userSchedulesByUser: UserScheduleRow[] }>(
        {
          query: GET_USER_SCHEDULES_BY_USER,
          variables: { userId: user.id },
        },
        (existing) => {
          if (!existing) return existing;
          if (existing.userSchedulesByUser.some((s) => s.id === created.id)) {
            return existing;
          }
          return {
            userSchedulesByUser: [...existing.userSchedulesByUser, created],
          };
        }
      );
    },
    onCompleted: () => {
      closeModal();
      toast.success('Event created successfully');
    },
    onError: (err) => {
      setFormError(getDisplayError(err));
    },
  });

  // UPDATE: Apollo auto-merges by `id` since the mutation response includes the
  // full UserScheduleFields fragment — no manual cache update needed.
  const [updateUserSchedule, { loading: updating }] = useMutation(UPDATE_USER_SCHEDULE, {
    onCompleted: () => {
      closeModal();
      toast.success('Event updated successfully');
    },
    onError: (err) => {
      setFormError(getDisplayError(err));
    },
  });

  const [removeUserSchedule, { loading: removing }] = useMutation(REMOVE_USER_SCHEDULE, {
    update: (cache, _result, options) => {
      const id = options?.variables?.id as string | undefined;
      if (!id) return;
      const cacheId = cache.identify({ __typename: 'UserSchedule', id });
      if (cacheId) {
        cache.evict({ id: cacheId });
        cache.gc();
      }
    },
    onCompleted: () => {
      setDeleteModalConfig({ isOpen: false, eventId: '', title: '' });
      toast.success('Event deleted successfully');
    },
    onError: (err) => {
      toast.error(getDisplayError(err));
    },
  });

  const schedules = data?.userSchedulesByUser || [];
  const events = mapToCalendarEvents(schedules);

  const selectedDateEvents = useMemo(() => {
    const selectedStr = format(selectedDate, 'yyyy-MM-dd');
    return schedules.filter(
      (s) => format(new Date(s.startTime), 'yyyy-MM-dd') === selectedStr
    );
  }, [schedules, selectedDate]);

  // Dynamic monthly stats
  const monthStats = useMemo(() => {
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const monthSchedules = schedules.filter((s) => {
      const d = new Date(s.startTime);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const availabilityDays = new Set(
      monthSchedules
        .filter((s) => s.type === 'availability')
        .map((s) => format(new Date(s.startTime), 'yyyy-MM-dd'))
    ).size;

    const confirmedReservationtions = monthSchedules.filter(
      (s) => s.type === 'reservation' && s.isConfirmed
    ).length;

    const pendingReservationtions = monthSchedules.filter(
      (s) => s.type === 'reservation' && !s.isConfirmed
    ).length;

    return { availabilityDays, confirmedReservationtions, pendingReservationtions };
  }, [schedules, selectedDate]);

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormError(null);
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setShowModal(true);
    setFormError(null);
  };

  const openEditModal = (event: UserScheduleRow) => {
    setEditingEvent(event);
    setShowModal(true);
    setFormError(null);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = (formData.get('title') as string)?.trim() ?? '';
    const description = (formData.get('description') as string) ?? '';
    const type = (formData.get('type') as string) ?? 'availability';
    const location = (formData.get('location') as string) ?? '';
    const tourId = (formData.get('tourId') as string) || undefined;
    const dateStr = (formData.get('date') as string) ?? format(selectedDate, 'yyyy-MM-dd');
    const startTimeStr = (formData.get('startTime') as string) ?? '09:00';
    const endTimeStr = (formData.get('endTime') as string) ?? '17:00';

    if (!title) { setFormError('Title is required.'); return; }
    if (!dateStr) { setFormError('Date is required.'); return; }
    if (!startTimeStr || !endTimeStr) { setFormError('Start and end times are required.'); return; }

    const startTime = new Date(`${dateStr}T${startTimeStr}:00`);
    const endTime = new Date(`${dateStr}T${endTimeStr}:00`);
    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      setFormError('Invalid date or time.'); return;
    }
    if (endTime <= startTime) {
      setFormError('End time must be after start time.'); return;
    }

    if (editingEvent) {
      updateUserSchedule({
        variables: {
          input: {
            id: editingEvent.id,
            title,
            description,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            type,
            location: location || undefined,
            tourId: tourId || null,
          },
        },
      });
    } else {
      createMyUserSchedule({
        variables: {
          input: {
            title,
            description,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            type,
            location: location || undefined,
            ...(tourId ? { tourId } : {}),
          },
        },
      });
    }
  };

  const handleDeleteConfirm = async () => {
    await removeUserSchedule({ variables: { id: deleteModalConfig.eventId } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border px-4 py-3"
        style={{ backgroundColor: 'var(--color-section-bg)', borderColor: 'var(--color-card-border)' }}
      >
        <p className="font-medium" style={{ color: 'var(--color-text-body)' }}>Could not load events</p>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{getDisplayError(error)}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 text-white rounded-lg hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!user?.id) {
    return (
      <p style={{ color: 'var(--color-text-secondary)' }}>Log in to view your agenda.</p>
    );
  }

  return (
    <div>
      <PageHeader
        title="Agenda"
        subtitle="Manage your availability and view your reservations"
        actions={
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Plus className="w-5 h-5" />
            Create Event
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatsCard
          label="Available days"
          value={monthStats.availabilityDays}
          icon={<CalendarDays size={20} />}
          variant="primary"
        />
        <StatsCard
          label="Confirmed reservations"
          value={monthStats.confirmedReservationtions}
          icon={<CheckCircle size={20} />}
          variant="success"
        />
        <StatsCard
          label="Pending reservations"
          value={monthStats.pendingReservationtions}
          icon={<AlertCircle size={20} />}
          variant="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Calendar
            events={events}
            onDateClick={setSelectedDate}
            selectedDate={selectedDate}
            onCreateEvent={(date) => {
              setSelectedDate(date);
              openCreateModal();
            }}
          />
        </div>

        {/* Events for selected date */}
        <div className="space-y-4">
          <div
            className="rounded-xl border p-6"
            style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-card-border)' }}
          >
            <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text-heading)' }}>
              {format(selectedDate, 'EEEE, d MMMM yyyy')}
            </h3>

            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                <p>No events for this day</p>
                <button
                  onClick={openCreateModal}
                  className="mt-4 hover:underline"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Create event
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className='p-4 rounded-lg border'
                    style={
                      event.type === 'availability'
                        ? { borderColor: 'var(--color-success-light)', backgroundColor: 'var(--color-success-light)' }
                        : { borderColor: 'var(--color-primary-light)', backgroundColor: 'var(--color-primary-light)' }
                    }
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium" style={{ color: 'var(--color-text-heading)' }}>{event.title}</h4>
                      <div className="flex items-center gap-1">
                        {event.isConfirmed && (
                          <span
                            className="text-xs px-2 py-1 rounded-full"
                            style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}
                          >
                            CONFIRMED
                          </span>
                        )}
                        <button
                          onClick={() => openEditModal(event)}
                          className="p-1 transition"
                          style={{ color: 'var(--color-text-muted)' }}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModalConfig({ isOpen: true, eventId: event.id, title: event.title })}
                          className="p-1 transition hover:text-[var(--color-danger)]"
                          style={{ color: 'var(--color-text-muted)' }}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>{event.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(new Date(event.startTime), 'HH:mm')}
                        {event.endTime && ` - ${format(new Date(event.endTime), 'HH:mm')}`}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.tour && (
                      <div className="flex items-center gap-2 text-sm mt-1" style={{ color: 'var(--color-primary)' }}>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'var(--color-primary-light)' }}
                        >
                          {event.tour.title}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--color-card-bg)' }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-heading)' }}>
                  {editingEvent ? 'Edit Event' : 'Create Event'}
                </h2>
                <button onClick={closeModal} style={{ color: 'var(--color-text-muted)' }}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-body)' }}>Event Title *</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingEvent?.title || ''}
                    placeholder="e.g. Tour available"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    style={{ borderColor: 'var(--color-card-border)' }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-body)' }}>Event Type *</label>
                  <select
                    name="type"
                    defaultValue={editingEvent?.type || 'availability'}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    style={{ borderColor: 'var(--color-card-border)' }}
                    required
                  >
                    <option value="availability">Availability</option>
                    <option value="reservation">Reservation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {guideTours.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-body)' }}>Associated Tour</label>
                    <select
                      name="tourId"
                      defaultValue={editingEvent?.tour?.id || ''}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                      style={{ borderColor: 'var(--color-card-border)' }}
                    >
                      <option value="">No tour</option>
                      {guideTours.map((tour) => (
                        <option key={tour.id} value={tour.id}>{tour.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-body)' }}>Date *</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={
                      editingEvent
                        ? format(new Date(editingEvent.startTime), 'yyyy-MM-dd')
                        : format(selectedDate, 'yyyy-MM-dd')
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    style={{ borderColor: 'var(--color-card-border)' }}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-body)' }}>Start Time *</label>
                    <input
                      type="time"
                      name="startTime"
                      value={startTimeValue}
                      onChange={(e) => {
                        const newStart = e.target.value;
                        setStartTimeValue(newStart);
                        if (!endTouched && newStart) {
                          setEndTimeValue(addOneHour(newStart));
                        }
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                      style={{ borderColor: 'var(--color-card-border)' }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-body)' }}>End Time *</label>
                    <input
                      type="time"
                      name="endTime"
                      value={endTimeValue}
                      onChange={(e) => {
                        setEndTimeValue(e.target.value);
                        setEndTouched(true);
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                      style={{ borderColor: 'var(--color-card-border)' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-body)' }}>Location</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingEvent?.location || ''}
                    placeholder="e.g. Main Plaza"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    style={{ borderColor: 'var(--color-card-border)' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-body)' }}>Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingEvent?.description || ''}
                    placeholder="Additional event information"
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    style={{ borderColor: 'var(--color-card-border)' }}
                  />
                </div>

                {formError && <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{formError}</p>}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border rounded-lg hover:opacity-80 transition"
                    style={{ borderColor: 'var(--color-card-border)', color: 'var(--color-text-body)' }}
                    disabled={creating || updating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                    disabled={creating || updating}
                  >
                    {creating || updating
                      ? 'Saving...'
                      : editingEvent
                      ? 'Update Event'
                      : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalConfig.isOpen}
        onClose={() => setDeleteModalConfig({ isOpen: false, eventId: '', title: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Event?"
        description={`Are you sure you want to delete "${deleteModalConfig.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={removing}
      />
    </div>
  );
}
