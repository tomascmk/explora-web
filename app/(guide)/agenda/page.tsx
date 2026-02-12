'use client';

import { useState } from 'react';
import { Calendar } from '@/components/agenda/Calendar';
import { format } from 'date-fns';
import { Plus, Clock, MapPin, X } from 'lucide-react';

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);

  // TODO: Replace with actual GraphQL queries
  const events = [
    {
      id: '1',
      date: new Date(2026, 1, 15),
      title: 'Available',
      type: 'availability' as const,
    },
    {
      id: '2',
      date: new Date(2026, 1, 16),
      title: 'Historic Tour - John Doe',
      type: 'reservation' as const,
      status: 'CONFIRMED',
    },
    {
      id: '3',
      date: new Date(2026, 1, 16),
      title: 'Available',
      type: 'availability' as const,
    },
  ];

  const selectedDateEvents = events.filter(
    (event) => format(new Date(event.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  );

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

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  console.log('Crear evento:', Object.fromEntries(formData));
                  // TODO: Implementar GraphQL mutation
                  setShowCreateModal(false);
                }}
                className="space-y-4"
              >
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

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Crear Evento
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
