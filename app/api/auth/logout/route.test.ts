import { describe, it, expect } from "vitest"
import { POST } from "./route"

describe("POST /api/auth/logout", () => {
  it("clears both auth cookies and returns success", async () => {
    const res = await POST()
    expect(res.status).toBe(200)
    expect((await res.json()).success).toBe(true)

    const setCookie = res.headers.get("set-cookie") ?? ""
    expect(setCookie).toContain("authToken=;")
    expect(setCookie).toContain("refreshToken=;")
    expect(setCookie).toContain("Max-Age=0")
  })
})
