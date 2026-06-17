import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"
import { POST } from "./route"

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("sets cookies and returns the user on success", async () => {
    const user = { id: "1", username: "u", email: "e@x.com", roles: ["traveler"] }
    const fetchSpy = vi.fn().mockResolvedValue({
      json: async () => ({
        data: {
          register: { access_token: "acc", refresh_token: "ref", user },
        },
      }),
    })
    vi.stubGlobal("fetch", fetchSpy)

    const res = await POST(
      makeRequest({
        username: "u",
        email: "e@x.com",
        fullName: "U Name",
        password: "pw",
        confirmPassword: "pw",
        roles: ["traveler"],
      }),
    )

    expect(res.status).toBe(200)
    expect((await res.json()).user).toEqual(user)
    expect(res.headers.get("set-cookie")).toContain("authToken=acc")

    // forwards the register variables to the backend
    const sentBody = JSON.parse(fetchSpy.mock.calls[0][1].body)
    expect(sentBody.variables.input.username).toBe("u")
    expect(sentBody.variables.input.confirmPassword).toBe("pw")
  })

  it("400 with the backend error message when registration fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ errors: [{ message: "Email taken" }] }),
      }),
    )

    const res = await POST(makeRequest({ email: "dup@x.com" }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("Email taken")
  })

  it("500 when the request body is invalid JSON / fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")))

    const res = await POST(makeRequest({ email: "e@x.com" }))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toBe("Registration failed")
  })
})
