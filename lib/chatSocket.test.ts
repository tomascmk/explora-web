import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const ioMock = vi.fn()
vi.mock("socket.io-client", () => ({
  io: (...args: unknown[]) => ioMock(...args),
}))

async function loadModule() {
  return import("./chatSocket")
}

describe("lib/chatSocket", () => {
  beforeEach(() => {
    vi.resetModules()
    ioMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("connects to the /chat namespace with the ticket", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ticket: "c-1" }) }),
    )
    const fakeSocket = { connected: false }
    ioMock.mockReturnValue(fakeSocket)

    const { connectChatSocket } = await loadModule()
    const socket = await connectChatSocket()

    expect(socket).toBe(fakeSocket)
    const [url, opts] = ioMock.mock.calls[0]
    expect(String(url)).toMatch(/\/chat$/)
    expect(opts.auth).toEqual({ ticket: "c-1" })
    expect(opts.reconnection).toBe(true)
  })

  it("returns null without connecting when no ticket is returned", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }),
    )

    const { connectChatSocket } = await loadModule()
    expect(await connectChatSocket()).toBeNull()
    expect(ioMock).not.toHaveBeenCalled()
  })

  it("returns null when the ticket request is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))

    const { connectChatSocket } = await loadModule()
    expect(await connectChatSocket()).toBeNull()
    expect(ioMock).not.toHaveBeenCalled()
  })

  it("returns null when the ticket request throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")))

    const { connectChatSocket } = await loadModule()
    expect(await connectChatSocket()).toBeNull()
  })
})
