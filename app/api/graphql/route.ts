import { NextRequest, NextResponse } from "next/server"
import {
  getApiUrl,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/auth/cookies"

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("authToken")?.value
    const body = await request.text()

    // Forward to backend API with auth header
    const apiResponse = await forwardToApi(body, accessToken)

    // If UNAUTHENTICATED error, try refresh
    if (hasUnauthenticatedError(apiResponse.data)) {
      const refreshToken = request.cookies.get("refreshToken")?.value
      if (!refreshToken) {
        return NextResponse.json(apiResponse.data, { status: 200 })
      }

      const refreshResult = await tryRefresh(refreshToken)
      if (!refreshResult) {
        const { headers } = clearAuthCookies()
        return NextResponse.json(apiResponse.data, { status: 200, headers })
      }

      // Retry original request with new token
      const retryResponse = await forwardToApi(body, refreshResult.accessToken)
      const { headers } = setAuthCookies(
        refreshResult.accessToken,
        refreshResult.refreshToken,
      )

      return NextResponse.json(retryResponse.data, { status: 200, headers })
    }

    return NextResponse.json(apiResponse.data, { status: 200 })
  } catch {
    return NextResponse.json(
      { errors: [{ message: "Internal proxy error" }] },
      { status: 500 },
    )
  }
}

async function forwardToApi(
  body: string,
  accessToken?: string,
): Promise<{ data: unknown }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  const response = await fetch(getApiUrl(), {
    method: "POST",
    headers,
    body,
  })

  if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
    return { data: { errors: [{ message: "Backend unavailable" }] } }
  }

  return { data: await response.json() }
}

function hasUnauthenticatedError(data: unknown): boolean {
  if (!data || typeof data !== "object") return false
  const errors = (data as Record<string, unknown>).errors
  if (!Array.isArray(errors)) return false
  return errors.some(
    (e: Record<string, unknown>) =>
      (e.extensions as Record<string, unknown>)?.code === "UNAUTHENTICATED",
  )
}

async function tryRefresh(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation RefreshToken($refreshToken: String!) {
            refreshToken(refreshToken: $refreshToken) {
              access_token
              refresh_token
            }
          }
        `,
        variables: { refreshToken },
      }),
    })

    const result = await response.json()
    if (result.errors || !result.data?.refreshToken) return null

    return {
      accessToken: result.data.refreshToken.access_token,
      refreshToken: result.data.refreshToken.refresh_token,
    }
  } catch {
    return null
  }
}
