'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
  id: string;
  date: Date;
  title: string;
  type: 'availability' | 'reservation';
  status?: string;
}

interface CalendarProps {
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  selectedDate?: Date;
  onCreateEvent?: (date: Date) => void;
}

export function Calendar({ events, onDateClick, selectedDate, onCreateEvent }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [lastClickTime, setLastClickTime] = useState<{ date: Date; time: number } | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.date), date));
  };

  const handleDateClick = (date: Date) => {
    const now = Date.now();
    const doubleClickThreshold = 300; // ms

    // Check for double-click
    if (
      onCreateEvent &&
      lastClickTime &&
      isSameDay(lastClickTime.date, date) &&
      now - lastClickTime.time < doubleClickThreshold
    ) {
      // Double-click detected: create event
      onCreateEvent(date);
      setLastClickTime(null);
    } else {
      // Single click: select date
      onDateClick(date);
      setLastClickTime({ date, time: now });
    }
  };

  return (
    <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--color-card-bg)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 rounded-lg transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-section-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-section-bg)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="text-center text-sm font-medium py-2" style={{ color: 'var(--color-text-body)' }}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days */}
        {days.map((day) => {
          const dayEvents = getEventsForDate(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              className={`
                aspect-square p-2 rounded-lg border transition-all
                ${isCurrentDay ? 'font-bold' : ''}
                ${!isSameMonth(day, currentMonth) ? 'opacity-50' : ''}
              `}
              style={{
                borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-card-border)',
                backgroundColor: isSelected ? 'var(--color-primary-light)' : undefined,
              }}
              title={onCreateEvent ? "Doble click para crear evento" : undefined}
            >
              <div className="flex flex-col h-full">
                <span className="text-sm">{format(day, 'd')}</span>
                <div className="flex-1 flex flex-col gap-1 mt-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className="w-full h-1 rounded"
                      style={{
                        backgroundColor: event.type === 'availability' ? 'var(--color-success)' : 'var(--color-primary)',
                      }}
                    />
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>+{dayEvents.length - 2}</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--color-success)' }}></div>
          <span style={{ color: 'var(--color-text-body)' }}>Disponibilidad</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--color-primary)' }}></div>
          <span style={{ color: 'var(--color-text-body)' }}>Reservas</span>
        </div>
      </div>
    </div>
  );
}
