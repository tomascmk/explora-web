import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { NextRequest } from "next/server"

process.env.API_URL = "http://api.test/graphql"

import { POST } from "./route"
import { getApiUrl } from "@/lib/auth/cookies"

const UNAUTH = {
  errors: [{ message: "no", extensions: { code: "UNAUTHENTICATED" } }],
}

function makeRequest(query: string, cookie?: string): NextRequest {
  const headers = new Headers({ "Content-Type": "application/json" })
  if (cookie) headers.set("cookie", cookie)
  return new NextRequest("http://localhost/api/graphql", {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
  })
}

function jsonResponse(payload: unknown) {
  return {
    ok: true,
    headers: { get: () => "application/json" },
    json: async () => payload,
  }
}

describe("POST /api/graphql", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("proxies a successful query and forwards the bearer token", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(jsonResponse({ data: { me: { id: "1" } } }))
    vi.stubGlobal("fetch", fetchSpy)

    const res = await POST(makeRequest("{ me { id } }", "authToken=acc"))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ data: { me: { id: "1" } } })

    const [url, opts] = fetchSpy.mock.calls[0]
    expect(url).toBe(getApiUrl())
    expect(opts.headers.Authorization).toBe("Bearer acc")
  })

  it("works without an auth cookie (no Authorization header)", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(jsonResponse({ data: {} }))
    vi.stubGlobal("fetch", fetchSpy)

    await POST(makeRequest("{ me { id } }"))
    expect(fetchSpy.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })

  it("returns 'Backend unavailable' when upstream is not ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        headers: { get: () => "application/json" },
        json: async () => ({}),
      }),
    )

    const res = await POST(makeRequest("{ me { id } }"))
    const json = await res.json()
    expect(json.errors[0].message).toBe("Backend unavailable")
  })

  it("returns 'Backend unavailable' when upstream content-type is not json", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => "text/html" },
        json: async () => ({}),
      }),
    )

    const res = await POST(makeRequest("{ me { id } }"))
    expect((await res.json()).errors[0].message).toBe("Backend unavailable")
  })

  it("passes UNAUTHENTICATED through unchanged when there is no refresh token", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(UNAUTH)))

    const res = await POST(makeRequest("{ me { id } }", "authToken=acc"))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(UNAUTH)
    expect(res.headers.get("set-cookie")).toBeNull()
  })

  it("clears cookies and returns original error when refresh fails", async () => {
    const fetchSpy = vi
      .fn()
      // 1) original request -> UNAUTHENTICATED
      .mockResolvedValueOnce(jsonResponse(UNAUTH))
      // 2) refresh attempt -> errors
      .mockResolvedValueOnce(jsonResponse({ errors: [{ message: "no" }] }))
    vi.stubGlobal("fetch", fetchSpy)

    const res = await POST(
      makeRequest("{ me { id } }", "authToken=acc; refreshToken=ref"),
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(UNAUTH)
    expect(res.headers.get("set-cookie")).toContain("Max-Age=0")
  })

  it("refreshes, retries and sets new cookies when refresh succeeds", async () => {
    const fetchSpy = vi
      .fn()
      // 1) original request -> UNAUTHENTICATED
      .mockResolvedValueOnce(jsonResponse(UNAUTH))
      // 2) refresh -> new tokens
      .mockResolvedValueOnce(
        jsonResponse({
          data: {
            refreshToken: { access_token: "new-acc", refresh_token: "new-ref" },
          },
        }),
      )
      // 3) retry -> success
      .mockResolvedValueOnce(jsonResponse({ data: { me: { id: "1" } } }))
    vi.stubGlobal("fetch", fetchSpy)

    const res = await POST(
      makeRequest("{ me { id } }", "authToken=acc; refreshToken=ref"),
    )
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ data: { me: { id: "1" } } })
    expect(res.headers.get("set-cookie")).toContain("authToken=new-acc")
    // retry used the new access token
    expect(fetchSpy.mock.calls[2][1].headers.Authorization).toBe("Bearer new-acc")
  })

  it("clears cookies when the refresh fetch throws", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(UNAUTH))
      .mockRejectedValueOnce(new Error("refresh down"))
    vi.stubGlobal("fetch", fetchSpy)

    const res = await POST(
      makeRequest("{ me { id } }", "authToken=acc; refreshToken=ref"),
    )
    expect(res.status).toBe(200)
    expect(res.headers.get("set-cookie")).toContain("Max-Age=0")
  })

  it("500 when reading the request body throws", async () => {
    // Force an error inside the try block by passing a request whose text() rejects.
    const badRequest = {
      cookies: { get: () => undefined },
      text: () => Promise.reject(new Error("boom")),
    } as unknown as NextRequest

    const res = await POST(badRequest)
    expect(res.status).toBe(500)
    expect((await res.json()).errors[0].message).toBe("Internal proxy error")
  })
})
