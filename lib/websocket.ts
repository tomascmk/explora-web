import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

async function getWsTicket(): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/ws-ticket", { method: "POST" })
    if (!response.ok) return null
    const data = await response.json()
    return data.ticket ?? null
  } catch {
    return null
  }
}

export async function connectWebSocket(): Promise<Socket | null> {
  if (socket?.connected) {
    return socket
  }

  const ticket = await getWsTicket()
  if (!ticket) {
    console.error("Failed to get WebSocket ticket")
    return null
  }

  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001"

  socket = io(WS_URL, {
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    auth: { ticket },
  })

  socket.on("connect", () => {
    console.log("WebSocket connected")
  })

  socket.on("disconnect", () => {
    console.log("WebSocket disconnected")
  })

  socket.on("connect_error", (error) => {
    console.error("WebSocket connection error:", error.message)
  })

  return socket
}

export function disconnectWebSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function getSocket() {
  return socket
}
