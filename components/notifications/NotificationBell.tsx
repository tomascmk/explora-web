'use client';

import { Bell } from 'lucide-react';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';

interface NotificationBellProps {
  onClick: () => void;
}

/**
 * Campana para barras superiores (hoy, el header mobile del portal del guía).
 *
 * El contador sale de `useUnreadNotifications`, compartido con el item de la
 * sidebar (PLAN-090): dos consultas separadas mostrarían números distintos en la
 * misma pantalla.
 */
export function NotificationBell({ onClick }: NotificationBellProps) {
  const { unreadCount } = useUnreadNotifications();

  return (
    <button
      onClick={onClick}
      aria-label="Notifications"
      className="relative p-2 rounded-lg transition-colors"
      style={{ color: 'var(--color-text-body)' }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-text-heading)'; e.currentTarget.style.backgroundColor = 'var(--color-section-bg)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-body)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 rounded-full" style={{ backgroundColor: 'var(--color-danger)' }}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
