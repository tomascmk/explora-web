'use client'

import { useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_UNREAD_COUNT } from '@/graphql/notifications'
import { getSocket } from '@/lib/websocket'

interface UnreadCountData {
  unreadNotificationsCount: number
}

/**
 * PLAN-090 — Contador de notificaciones sin leer.
 *
 * Extraído de `NotificationBell` para que la campana del header mobile y el item
 * de la sidebar compartan una sola fuente: si cada uno consultara por su lado,
 * mostrarían números distintos en la misma pantalla.
 *
 * El socket refresca al vuelo; el `pollInterval` queda de red de seguridad para
 * cuando el websocket no está disponible.
 */
export function useUnreadNotifications(): { unreadCount: number } {
  const { data, refetch } = useQuery<UnreadCountData>(GET_UNREAD_COUNT, {
    pollInterval: 30000,
  })

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    socket.on('notification', () => {
      refetch()
    })

    return () => {
      socket.off('notification')
    }
  }, [refetch])

  return { unreadCount: data?.unreadNotificationsCount ?? 0 }
}
