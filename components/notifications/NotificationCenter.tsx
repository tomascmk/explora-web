'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { GET_MY_NOTIFICATIONS, MARK_AS_READ, MARK_ALL_AS_READ } from '@/graphql/notifications';
import { formatDistanceToNow } from 'date-fns';
import { X, Check, CheckCheck, Bell } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: unknown;
  read: boolean;
  channels: unknown;
  createdAt: string;
}

interface MyNotificationsData {
  myNotifications: Notification[];
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { data, loading, refetch } = useQuery<MyNotificationsData>(GET_MY_NOTIFICATIONS, {
    variables: { limit: 20, offset: 0 },
    skip: !isOpen,
  });

  const [markAsRead] = useMutation(MARK_AS_READ, {
    onCompleted: () => refetch(),
  });

  const [markAllAsRead] = useMutation(MARK_ALL_AS_READ, {
    onCompleted: () => refetch(),
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const notifications: Notification[] = data?.myNotifications || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onClose} />
      
      <div
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-full max-w-md shadow-xl"
        style={{ backgroundColor: 'var(--color-card-bg)' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <div className="flex items-center gap-2">
              {notifications.some((n: Notification) => !n.read) && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-sm flex items-center gap-1"
                  style={{ color: 'var(--color-primary)' }}
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all as read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded-lg transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-section-bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32" style={{ color: 'var(--color-text-secondary)' }}>
                <Bell className="w-12 h-12 mb-2 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className="p-4 cursor-pointer transition-colors"
                    style={{
                      backgroundColor: !notification.read ? 'var(--color-primary-light)' : undefined,
                    }}
                    onMouseEnter={(e) => { if (notification.read) e.currentTarget.style.backgroundColor = 'var(--color-section-bg)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = !notification.read ? 'var(--color-primary-light)' : ''; }}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead({ variables: { id: notification.id } });
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium" style={{ color: 'var(--color-text-heading)' }}>{notification.title}</h3>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-body)' }}>{notification.body}</p>
                        <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="ml-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
