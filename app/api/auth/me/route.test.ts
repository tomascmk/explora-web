import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"

const jwtVerifyMock = vi.fn()
vi.mock("jose", () => ({
  jwtVerify: (...args: unknown[]) => jwtVerifyMock(...args),
}))

process.env.JWT_ACCESS_SECRET = "test-secret"

function makeRequest(cookie?: string): NextRequest {
  const headers = new Headers()
  if (cookie) headers.set("cookie", cookie)
  return new NextRequest("http://localhost/api/auth/me", {
    method: "GET",
    headers,
  })
}

async function loadRoute() {
  return import("./route")
}

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    jwtVerifyMock.mockReset()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("401 when there is no auth cookie", async () => {
    const { GET } = await loadRoute()
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe("Not authenticated")
  })

  it("returns the decoded user from a valid token", async () => {
    jwtVerifyMock.mockResolvedValue({
      payload: {
        sub: "u1",
        username: "name",
        email: "e@x.com",
        roles: ["admin"],
        fullName: "Full Name",
      },
    })

    const { GET } = await loadRoute()
    const res = await GET(makeRequest("authToken=valid"))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.user).toEqual({
      id: "u1",
      username: "name",
      email: "e@x.com",
      roles: ["admin"],
      fullName: "Full Name",
    })
  })

  it("defaults roles to [] and fullName to null when absent", async () => {
    jwtVerifyMock.mockResolvedValue({
      payload: { sub: "u2", username: "n", email: "e2@x.com" },
    })

    const { GET } = await loadRoute()
    const res = await GET(makeRequest("authToken=valid"))
    const json = await res.json()
    expect(json.user.roles).toEqual([])
    expect(json.user.fullName).toBeNull()
  })

  it("401 when token verification throws", async () => {
    jwtVerifyMock.mockRejectedValue(new Error("bad signature"))

    const { GET } = await loadRoute()
    const res = await GET(makeRequest("authToken=tampered"))
    expect(res.status).toBe(401)
    expect((await res.json()).error).toBe("Invalid token")
  })
})
