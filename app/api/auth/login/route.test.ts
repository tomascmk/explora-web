import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"
import { POST } from "./route"

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("400 when email or password is missing", async () => {
    const res = await POST(makeRequest({ email: "" }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/required/i)
  })

  it("sets auth cookies and returns the user on success", async () => {
    const user = { id: "1", username: "u", email: "e@x.com", roles: ["traveler"] }
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({
          data: {
            login: {
              access_token: "acc",
              refresh_token: "ref",
              user,
            },
          },
        }),
      }),
    )

    const res = await POST(makeRequest({ email: "e@x.com", password: "pw" }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.user).toEqual(user)
    const setCookie = res.headers.get("set-cookie") ?? ""
    expect(setCookie).toContain("authToken=acc")
  })

  it("401 with the backend error message when login fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ errors: [{ message: "Invalid credentials" }] }),
      }),
    )

    const res = await POST(makeRequest({ email: "e@x.com", password: "bad" }))
    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe("Invalid credentials")
  })

  it("500 when the upstream fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")))

    const res = await POST(makeRequest({ email: "e@x.com", password: "pw" }))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toBe("Login failed")
  })
})
