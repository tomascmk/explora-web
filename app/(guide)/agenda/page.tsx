'use client';

import { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar } from '@/components/agenda/Calendar';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { format } from 'date-fns';
import { Plus, Clock, MapPin, X, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  GET_USER_SCHEDULES_BY_USER,
  CREATE_MY_USER_SCHEDULE,
  UPDATE_USER_SCHEDULE,
  REMOVE_USER_SCHEDULE,
} from '@/graphql/agenda';
import { GET_TOURS_BY_GUIDE } from '@/graphql/tours';

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
  const formRef = useRef<HTMLFormElement>(null);

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

  const [createMyUserSchedule, { loading: creating }] = useMutation(CREATE_MY_USER_SCHEDULE, {
    onCompleted: () => {
      closeModal();
      toast.success('Event created successfully');
      refetch();
    },
    onError: (err) => {
      setFormError(err.message ?? 'Failed to create event');
    },
  });

  const [updateUserSchedule, { loading: updating }] = useMutation(UPDATE_USER_SCHEDULE, {
    onCompleted: () => {
      closeModal();
      toast.success('Event updated successfully');
      refetch();
    },
    onError: (err) => {
      setFormError(err.message ?? 'Failed to update event');
    },
  });

  const [removeUserSchedule, { loading: removing }] = useMutation(REMOVE_USER_SCHEDULE, {
    onCompleted: () => {
      setDeleteModalConfig({ isOpen: false, eventId: '', title: '' });
      toast.success('Event deleted successfully');
      refetch();
    },
    onError: (err) => {
      toast.error(err.message ?? 'Failed to delete event');
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
      <div className="p-8 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded">
          <p className="font-medium text-gray-700">Could not load events</p>
          <p className="text-sm text-gray-600">{error.message}</p>
          <button onClick={() => refetch()} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Log in to view your agenda.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Agenda</h1>
          <p className="text-gray-600">Manage your availability and view your reservations</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </button>
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

        {/* Events for selected date + Stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">
              {format(selectedDate, 'EEEE, d MMMM yyyy')}
            </h3>

            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No events for this day</p>
                <button onClick={openCreateModal} className="mt-4 text-blue-600 hover:underline">
                  Create event
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border ${
                      event.type === 'availability'
                        ? 'border-green-200 bg-green-50'
                        : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex items-center gap-1">
                        {event.isConfirmed && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            CONFIRMED
                          </span>
                        )}
                        <button
                          onClick={() => openEditModal(event)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModalConfig({ isOpen: true, eventId: event.id, title: event.title })}
                          className="p-1 text-gray-400 hover:text-red-600 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(new Date(event.startTime), 'HH:mm')}
                        {event.endTime && ` - ${format(new Date(event.endTime), 'HH:mm')}`}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.tour && (
                      <div className="flex items-center gap-2 text-sm text-blue-600 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-blue-100 rounded-full">
                          🗺️ {event.tour.title}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats - Dynamic */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Monthly Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Available days</span>
                <span className="font-semibold">{monthStats.availabilityDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Confirmed reservations</span>
                <span className="font-semibold text-green-600">{monthStats.confirmedReservationtions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending reservations</span>
                <span className="font-semibold text-yellow-600">{monthStats.pendingReservationtions}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingEvent ? 'Edit Event' : 'Create Event'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Event Title *</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingEvent?.title || ''}
                    placeholder="e.g. Tour available"
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Event Type *</label>
                  <select
                    name="type"
                    defaultValue={editingEvent?.type || 'availability'}
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="availability">Availability</option>
                    <option value="reservation">Reservation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {guideTours.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Associated Tour</label>
                    <select
                      name="tourId"
                      defaultValue={editingEvent?.tour?.id || ''}
                      className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No tour</option>
                      {guideTours.map((tour) => (
                        <option key={tour.id} value={tour.id}>{tour.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Date *</label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={
                      editingEvent
                        ? format(new Date(editingEvent.startTime), 'yyyy-MM-dd')
                        : format(selectedDate, 'yyyy-MM-dd')
                    }
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Time *</label>
                    <input
                      type="time"
                      name="startTime"
                      defaultValue={
                        editingEvent
                          ? format(new Date(editingEvent.startTime), 'HH:mm')
                          : '09:00'
                      }
                      className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">End Time *</label>
                    <input
                      type="time"
                      name="endTime"
                      defaultValue={
                        editingEvent?.endTime
                          ? format(new Date(editingEvent.endTime), 'HH:mm')
                          : '17:00'
                      }
                      className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingEvent?.location || ''}
                    placeholder="e.g. Main Plaza"
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingEvent?.description || ''}
                    placeholder="Additional event information"
                    rows={3}
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {formError && <p className="text-sm text-red-600">{formError}</p>}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    disabled={creating || updating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
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
