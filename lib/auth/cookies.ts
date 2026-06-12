const IS_PRODUCTION = process.env.NODE_ENV === "production"
const API_URL = process.env.API_URL || "http://localhost:3001/graphql"

export function getApiUrl(): string {
  return API_URL
}

export function setAuthCookies(
  accessToken: string,
  refreshToken: string,
): { headers: Headers } {
  const headers = new Headers()

  const secureSuffix = IS_PRODUCTION ? "; Secure" : ""

  headers.append(
    "Set-Cookie",
    `authToken=${accessToken}; HttpOnly; SameSite=Strict; Path=/; Max-Age=14400${secureSuffix}`,
  )
  headers.append(
    "Set-Cookie",
    `refreshToken=${refreshToken}; HttpOnly; SameSite=Strict; Path=/api/auth; Max-Age=604800${secureSuffix}`,
  )

  return { headers }
}

export function clearAuthCookies(): { headers: Headers } {
  const headers = new Headers()

  headers.append(
    "Set-Cookie",
    "authToken=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
  )
  headers.append(
    "Set-Cookie",
    "refreshToken=; HttpOnly; SameSite=Strict; Path=/api/auth; Max-Age=0",
  )

  return { headers }
}
