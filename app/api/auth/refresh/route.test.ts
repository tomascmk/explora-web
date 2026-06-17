import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"
import { POST } from "./route"

function makeRequest(cookie?: string): NextRequest {
  const headers = new Headers()
  if (cookie) headers.set("cookie", cookie)
  return new NextRequest("http://localhost/api/auth/refresh", {
    method: "POST",
    headers,
  })
}

describe("POST /api/auth/refresh", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("401 and clears cookies when there is no refresh token", async () => {
    const res = await POST(makeRequest())
    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe("No refresh token")
    expect(res.headers.get("set-cookie")).toContain("Max-Age=0")
  })

  it("sets new cookies and returns the user on success", async () => {
    const user = { id: "1", username: "u", email: "e@x.com", roles: [] }
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({
          data: {
            refreshToken: {
              access_token: "new-acc",
              refresh_token: "new-ref",
              user,
            },
          },
        }),
      }),
    )

    const res = await POST(makeRequest("refreshToken=ref-123"))
    expect(res.status).toBe(200)
    expect((await res.json()).user).toEqual(user)
    expect(res.headers.get("set-cookie")).toContain("authToken=new-acc")
  })

  it("401 and clears cookies when backend returns errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ errors: [{ message: "expired" }] }),
      }),
    )

    const res = await POST(makeRequest("refreshToken=ref-123"))
    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe("Refresh failed")
    expect(res.headers.get("set-cookie")).toContain("Max-Age=0")
  })

  it("401 and clears cookies when refreshToken payload is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: async () => ({ data: {} }) }),
    )

    const res = await POST(makeRequest("refreshToken=ref-123"))
    expect(res.status).toBe(401)
  })

  it("500 and clears cookies when the fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")))

    const res = await POST(makeRequest("refreshToken=ref-123"))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toBe("Refresh failed")
    expect(res.headers.get("set-cookie")).toContain("Max-Age=0")
  })
})
