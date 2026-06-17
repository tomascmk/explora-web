import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"

const connectChatSocketMock = vi.fn()
vi.mock("@/lib/chatSocket", () => ({
  connectChatSocket: () => connectChatSocketMock(),
}))

import { useChatSocket } from "./useChatSocket"

function makeFakeSocket() {
  const listeners: Record<string, (arg: unknown) => void> = {}
  return {
    on: vi.fn((event: string, cb: (arg: unknown) => void) => {
      listeners[event] = cb
    }),
    emit: vi.fn(),
    disconnect: vi.fn(),
    listeners,
  }
}

describe("useChatSocket", () => {
  beforeEach(() => {
    connectChatSocketMock.mockReset()
  })

  it("connects, wires handlers and reflects connected state", async () => {
    const socket = makeFakeSocket()
    connectChatSocketMock.mockResolvedValue(socket)

    const onMessage = vi.fn()
    const onTyping = vi.fn()
    const onRead = vi.fn()
    const { result } = renderHook(() =>
      useChatSocket({ onMessage, onTyping, onRead }),
    )

    await waitFor(() =>
      expect(socket.on).toHaveBeenCalledWith("connect", expect.any(Function)),
    )

    // drive lifecycle + chat events through the registered listeners
    act(() => socket.listeners.connect(undefined))
    expect(result.current.connected).toBe(true)

    act(() => socket.listeners["chat:message"]({ id: "m1" }))
    expect(onMessage).toHaveBeenCalledWith({ id: "m1" })

    act(() => socket.listeners["chat:typing"]({ conversationId: "c", from: "u" }))
    expect(onTyping).toHaveBeenCalledWith({ conversationId: "c", from: "u" })

    act(() => socket.listeners["chat:read"]({ conversationId: "c", by: "u" }))
    expect(onRead).toHaveBeenCalledWith({ conversationId: "c", by: "u" })

    act(() => socket.listeners.disconnect(undefined))
    expect(result.current.connected).toBe(false)
  })

  it("sendTyping / sendRead emit on the socket", async () => {
    const socket = makeFakeSocket()
    connectChatSocketMock.mockResolvedValue(socket)

    const { result } = renderHook(() => useChatSocket({}))
    await waitFor(() => expect(socket.on).toHaveBeenCalled())

    act(() => result.current.sendTyping("conv-1"))
    expect(socket.emit).toHaveBeenCalledWith("chat:typing", {
      conversationId: "conv-1",
    })

    act(() => result.current.sendRead("conv-1"))
    expect(socket.emit).toHaveBeenCalledWith("chat:read", {
      conversationId: "conv-1",
    })
  })

  it("emit helpers are no-ops before the socket connects", () => {
    // never resolves -> socketRef stays null
    connectChatSocketMock.mockReturnValue(new Promise(() => {}))

    const { result } = renderHook(() => useChatSocket({}))
    expect(() => result.current.sendTyping("c")).not.toThrow()
    expect(() => result.current.sendRead("c")).not.toThrow()
    expect(result.current.connected).toBe(false)
  })

  it("does nothing when connectChatSocket resolves null", async () => {
    connectChatSocketMock.mockResolvedValue(null)

    const { result } = renderHook(() => useChatSocket({}))
    // give the microtask a chance to settle
    await act(async () => {
      await Promise.resolve()
    })
    expect(result.current.connected).toBe(false)
  })

  it("disconnects the late-arriving socket if unmounted before it resolves", async () => {
    const socket = makeFakeSocket()
    let resolveFn: (s: unknown) => void = () => {}
    connectChatSocketMock.mockReturnValue(
      new Promise((resolve) => {
        resolveFn = resolve
      }),
    )

    const { unmount } = renderHook(() => useChatSocket({}))
    unmount()
    // socket resolves after unmount -> hook should disconnect it
    await act(async () => {
      resolveFn(socket)
      await Promise.resolve()
    })
    expect(socket.disconnect).toHaveBeenCalled()
  })

  it("disconnects the socket on unmount", async () => {
    const socket = makeFakeSocket()
    connectChatSocketMock.mockResolvedValue(socket)

    const { unmount } = renderHook(() => useChatSocket({}))
    await waitFor(() => expect(socket.on).toHaveBeenCalled())

    unmount()
    expect(socket.disconnect).toHaveBeenCalled()
  })

  it("swallows a rejected connectChatSocket", async () => {
    connectChatSocketMock.mockRejectedValue(new Error("nope"))

    const { result } = renderHook(() => useChatSocket({}))
    await act(async () => {
      await Promise.resolve()
    })
    expect(result.current.connected).toBe(false)
  })
})
