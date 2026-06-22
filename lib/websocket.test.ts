import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const ioMock = vi.fn()
vi.mock("socket.io-client", () => ({
  io: (...args: unknown[]) => ioMock(...args),
}))

// Imported lazily after mocks are set up; module keeps a singleton socket so we
// reset modules between tests to start clean.
async function loadModule() {
  return import("./websocket")
}

function makeFakeSocket(connected = false) {
  return {
    connected,
    on: vi.fn(),
    disconnect: vi.fn(),
  }
}

describe("lib/websocket", () => {
  beforeEach(() => {
    vi.resetModules()
    ioMock.mockReset()
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.spyOn(console, "log").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("connects with a ticket and registers lifecycle listeners", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ticket: "tkt-1" }),
      }),
    )
    const fakeSocket = makeFakeSocket()
    ioMock.mockReturnValue(fakeSocket)

    const { connectWebSocket, getSocket } = await loadModule()
    const socket = await connectWebSocket()

    expect(socket).toBe(fakeSocket)
    expect(getSocket()).toBe(fakeSocket)
    const [, opts] = ioMock.mock.calls[0]
    expect(opts.auth).toEqual({ ticket: "tkt-1" })
    expect(opts.transports).toEqual(["websocket"])
    // connect/disconnect/connect_error listeners registered
    const events = fakeSocket.on.mock.calls.map((c) => c[0])
    expect(events).toEqual(
      expect.arrayContaining(["connect", "disconnect", "connect_error"]),
    )
  })

  it("invokes the registered lifecycle callbacks (coverage of handlers)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ticket: "t" }) }),
    )
    const fakeSocket = makeFakeSocket()
    ioMock.mockReturnValue(fakeSocket)

    const { connectWebSocket } = await loadModule()
    await connectWebSocket()

    const handlers = Object.fromEntries(fakeSocket.on.mock.calls)
    handlers.connect()
    handlers.disconnect()
    handlers.connect_error({ message: "boom" })
    expect(console.error).toHaveBeenCalledWith(
      "WebSocket connection error:",
      "boom",
    )
  })

  it("returns the existing socket when already connected without re-fetching", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ ticket: "t" }) })
    vi.stubGlobal("fetch", fetchSpy)
    const fakeSocket = makeFakeSocket(false)
    ioMock.mockReturnValue(fakeSocket)

    const { connectWebSocket } = await loadModule()
    await connectWebSocket()
    // now flip to connected and call again
    fakeSocket.connected = true
    const second = await connectWebSocket()

    expect(second).toBe(fakeSocket)
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    expect(ioMock).toHaveBeenCalledTimes(1)
  })

  it("returns null and logs when the ticket request is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))

    const { connectWebSocket } = await loadModule()
    const socket = await connectWebSocket()

    expect(socket).toBeNull()
    expect(console.error).toHaveBeenCalledWith("Failed to get WebSocket ticket")
    expect(ioMock).not.toHaveBeenCalled()
  })

  it("returns null when fetching the ticket throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")))

    const { connectWebSocket } = await loadModule()
    const socket = await connectWebSocket()

    expect(socket).toBeNull()
  })

  it("returns null when the ticket response has no ticket field", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
    )

    const { connectWebSocket } = await loadModule()
    expect(await connectWebSocket()).toBeNull()
  })

  it("disconnectWebSocket disconnects and clears the singleton", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ticket: "t" }) }),
    )
    const fakeSocket = makeFakeSocket()
    ioMock.mockReturnValue(fakeSocket)

    const { connectWebSocket, disconnectWebSocket, getSocket } =
      await loadModule()
    await connectWebSocket()
    disconnectWebSocket()

    expect(fakeSocket.disconnect).toHaveBeenCalled()
    expect(getSocket()).toBeNull()
  })

  it("disconnectWebSocket is a no-op when no socket exists", async () => {
    const { disconnectWebSocket, getSocket } = await loadModule()
    expect(() => disconnectWebSocket()).not.toThrow()
    expect(getSocket()).toBeNull()
  })
})
