import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"

const jwtVerifyMock = vi.fn()
vi.mock("jose", () => ({
  jwtVerify: (...args: unknown[]) => jwtVerifyMock(...args),
}))

process.env.JWT_ACCESS_SECRET = "test-secret"

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/auth/oauth-exchange", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
}

async function loadRoute() {
  return import("./route")
}

describe("POST /api/auth/oauth-exchange", () => {
  beforeEach(() => {
    jwtVerifyMock.mockReset()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("400 when tokens are missing", async () => {
    const { POST } = await loadRoute()
    const res = await POST(makeRequest({ accessToken: "" }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe("Missing tokens")
  })

  it("verifies the access token, sets cookies and returns the user", async () => {
    jwtVerifyMock.mockResolvedValue({
      payload: {
        sub: "u1",
        username: "name",
        email: "e@x.com",
        roles: ["traveler"],
        fullName: "Full",
      },
    })

    const { POST } = await loadRoute()
    const res = await POST(
      makeRequest({ accessToken: "acc", refreshToken: "ref" }),
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.user.id).toBe("u1")
    expect(json.user.roles).toEqual(["traveler"])
    expect(res.headers.get("set-cookie")).toContain("authToken=acc")
  })

  it("defaults roles to [] and fullName to null", async () => {
    jwtVerifyMock.mockResolvedValue({
      payload: { sub: "u2", username: "n", email: "e2@x.com" },
    })

    const { POST } = await loadRoute()
    const res = await POST(
      makeRequest({ accessToken: "acc", refreshToken: "ref" }),
    )
    const json = await res.json()
    expect(json.user.roles).toEqual([])
    expect(json.user.fullName).toBeNull()
  })

  it("401 when the access token is invalid", async () => {
    jwtVerifyMock.mockRejectedValue(new Error("invalid"))

    const { POST } = await loadRoute()
    const res = await POST(
      makeRequest({ accessToken: "bad", refreshToken: "ref" }),
    )
    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe("Invalid tokens")
  })
})
