import { describe, it, expect } from "vitest"
import { getApiUrl, setAuthCookies, clearAuthCookies } from "./cookies"

function getSetCookies(headers: Headers): string[] {
  // Headers.getSetCookie is available in undici/node fetch
  const getter = (headers as unknown as { getSetCookie?: () => string[] })
    .getSetCookie
  if (typeof getter === "function") return getter.call(headers)
  const single = headers.get("set-cookie")
  return single ? [single] : []
}

describe("cookies helpers", () => {
  it("getApiUrl returns a non-empty string", () => {
    expect(typeof getApiUrl()).toBe("string")
    expect(getApiUrl().length).toBeGreaterThan(0)
  })

  it("setAuthCookies sets HttpOnly auth + refresh cookies with correct attributes", () => {
    const { headers } = setAuthCookies("access-123", "refresh-456")
    const cookies = getSetCookies(headers).join("\n")

    expect(cookies).toContain("authToken=access-123")
    expect(cookies).toContain("refreshToken=refresh-456")
    expect(cookies).toContain("HttpOnly")
    expect(cookies).toContain("SameSite=Strict")
    expect(cookies).toContain("Max-Age=14400")
    expect(cookies).toContain("Max-Age=604800")
    // refresh cookie scoped to /api
    expect(cookies).toContain("Path=/api")
  })

  it("clearAuthCookies expires both cookies (Max-Age=0)", () => {
    const { headers } = clearAuthCookies()
    const cookies = getSetCookies(headers)

    expect(cookies.length).toBe(2)
    const joined = cookies.join("\n")
    expect(joined).toContain("authToken=;")
    expect(joined).toContain("refreshToken=;")
    expect((joined.match(/Max-Age=0/g) || []).length).toBe(2)
    expect(joined).toContain("HttpOnly")
  })
})
