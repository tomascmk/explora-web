import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"
import { POST } from "./route"

function makeRequest(cookie?: string): NextRequest {
  const headers = new Headers()
  if (cookie) headers.set("cookie", cookie)
  return new NextRequest("http://localhost/api/auth/ws-ticket", {
    method: "POST",
    headers,
  })
}

describe("POST /api/auth/ws-ticket", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("401 when there is no auth cookie", async () => {
    const res = await POST(makeRequest())
    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe("Not authenticated")
  })

  it("returns the ticket and forwards the bearer token to the backend", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ticket: "tkt-xyz" }),
    })
    vi.stubGlobal("fetch", fetchSpy)

    const res = await POST(makeRequest("authToken=acc-token"))
    expect(res.status).toBe(200)
    expect((await res.json()).ticket).toBe("tkt-xyz")

    const [url, opts] = fetchSpy.mock.calls[0]
    expect(String(url)).toContain("/auth/ws-ticket")
    expect(opts.headers.Authorization).toBe("Bearer acc-token")
  })

  it("500 when the backend responds not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))

    const res = await POST(makeRequest("authToken=acc-token"))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toBe("Failed to get ticket")
  })

  it("500 when the fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")))

    const res = await POST(makeRequest("authToken=acc-token"))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toBe("Failed to get ticket")
  })
})
