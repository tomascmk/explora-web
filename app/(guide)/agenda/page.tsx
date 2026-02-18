'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar } from '@/components/agenda/Calendar';
import { format } from 'date-fns';
import { Plus, Clock, MapPin, X } from 'lucide-react';
import { GET_USER_SCHEDULES_BY_USER, CREATE_MY_USER_SCHEDULE } from '@/graphql/agenda';

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { data, loading, error, refetch } = useQuery<{ userSchedulesByUser: UserScheduleRow[] }>(
    GET_USER_SCHEDULES_BY_USER,
    {
      variables: { userId: user?.id ?? '' },
      skip: !user?.id,
    }
  );

  const [createMyUserSchedule, { loading: creating }] = useMutation(CREATE_MY_USER_SCHEDULE, {
    onCompleted: () => {
      setShowCreateModal(false);
      setCreateError(null);
      refetch();
    },
    onError: (err) => {
      setCreateError(err.message ?? 'Error al crear el evento');
    },
  });

  const events = mapToCalendarEvents(data?.userSchedulesByUser);
  const selectedDateEvents = events.filter(
    (event) => format(new Date(event.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = (formData.get('title') as string)?.trim() ?? '';
    const description = (formData.get('description') as string) ?? '';
    const type = (formData.get('type') as string) ?? 'availability';
    const dateStr = (formData.get('date') as string) ?? format(selectedDate, 'yyyy-MM-dd');
    const startTimeStr = (formData.get('startTime') as string) ?? '09:00';
    const endTimeStr = (formData.get('endTime') as string) ?? '17:00';
    if (!title) {
      setCreateError('El título es obligatorio.');
      return;
    }
    if (!dateStr) {
      setCreateError('La fecha es obligatoria.');
      return;
    }
    if (!startTimeStr || !endTimeStr) {
      setCreateError('Las horas de inicio y fin son obligatorias.');
      return;
    }
    const startTime = new Date(`${dateStr}T${startTimeStr}:00`);
    const endTime = new Date(`${dateStr}T${endTimeStr}:00`);
    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      setCreateError('Fecha u hora no válidas.');
      return;
    }
    if (endTime <= startTime) {
      setCreateError('La hora fin debe ser posterior a la hora inicio.');
      return;
    }
    createMyUserSchedule({
      variables: {
        input: {
          title,
          description,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          type,
        },
      },
    });
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
          <p className="font-medium text-gray-700">No se pudieron cargar los eventos</p>
          <p className="text-sm text-gray-600">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Inicia sesión para ver tu agenda.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Agenda</h1>
          <p className="text-gray-600">Gestiona tu disponibilidad y visualiza tus reservas</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Crear Evento
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
              setShowCreateModal(true);
            }}
          />
        </div>

        {/* Events for selected date */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">
              {format(selectedDate, 'EEEE, d MMMM yyyy')}
            </h3>

            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No hay eventos para este día</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 text-blue-600 hover:underline"
                >
                  Crear evento
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
                      {event.status && (
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                          {event.status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>09:00 - 17:00</span>
                    </div>
                    {event.type === 'reservation' && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>Central Park</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Estadísticas del Mes</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Días disponibles</span>
                <span className="font-semibold">15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reservas confirmadas</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reservas pendientes</span>
                <span className="font-semibold">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Crear Evento</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form ref={formRef} onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Título del Evento *
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="ej. Tour disponible"
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tipo de Evento *
                  </label>
                  <select
                    name="type"
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="availability">Disponibilidad</option>
                    <option value="reservation">Reserva</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={format(selectedDate, 'yyyy-MM-dd')}
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Hora Inicio *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      defaultValue="09:00"
                      className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Hora Fin *
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      defaultValue="17:00"
                      className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    placeholder="Información adicional del evento"
                    rows={3}
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {createError && (
                  <p className="text-sm text-red-600">{createError}</p>
                )}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); setCreateError(null); }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    disabled={creating}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const form = formRef.current;
                      if (form) {
                        const syntheticEvent = {
                          preventDefault: () => {},
                          currentTarget: form,
                        } as React.FormEvent<HTMLFormElement>;
                        handleCreateSubmit(syntheticEvent);
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={creating}
                  >
                    {creating ? 'Creando…' : 'Crear Evento'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
