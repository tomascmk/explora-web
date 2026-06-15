import { io, Socket } from "socket.io-client"

async function getWsTicket(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/ws-ticket", { method: "POST" })
    if (!res.ok) return null
    const data = await res.json()
    return data.ticket ?? null
  } catch {
    return null
  }
}

/**
 * Conexión dedicada al namespace `/chat` (PLAN-038). Separada del socket de
 * notificaciones (lib/websocket.ts) porque el ws-ticket es de un solo uso →
 * cada namespace necesita el suyo.
 */
export async function connectChatSocket(): Promise<Socket | null> {
  const ticket = await getWsTicket()
  if (!ticket) return null
  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001"
  return io(`${WS_URL}/chat`, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    auth: { ticket },
  })
}
