'use client';

import { useQuery } from '@apollo/client/react';
import { GET_UNREAD_COUNT } from '@/graphql/notifications';
import { Bell } from 'lucide-react';
import { useEffect } from 'react';
import { getSocket } from '@/lib/websocket';

interface UnreadCountData {
  unreadNotificationsCount: number;
}

interface NotificationBellProps {
  onClick: () => void;
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const { data, refetch } = useQuery<UnreadCountData>(GET_UNREAD_COUNT, {
    pollInterval: 30000, // Poll every 30 seconds as fallback
  });

  useEffect(() => {
    const socket = getSocket();
    
    if (socket) {
      socket.on('notification', () => {
        refetch();
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [refetch]);

  const unreadCount = data?.unreadNotificationsCount || 0;

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
