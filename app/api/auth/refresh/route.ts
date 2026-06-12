import { NextRequest, NextResponse } from "next/server"
import {
  getApiUrl,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/auth/cookies"

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value

  if (!refreshToken) {
    const { headers } = clearAuthCookies()
    return NextResponse.json(
      { error: "No refresh token" },
      { status: 401, headers },
    )
  }

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
              user { id username email roles fullName }
            }
          }
        `,
        variables: { refreshToken },
      }),
    })

    const result = await response.json()

    if (result.errors || !result.data?.refreshToken) {
      const { headers } = clearAuthCookies()
      return NextResponse.json(
        { error: "Refresh failed" },
        { status: 401, headers },
      )
    }

    const { access_token, refresh_token, user } = result.data.refreshToken
    const { headers } = setAuthCookies(access_token, refresh_token)

    return NextResponse.json({ user }, { status: 200, headers })
  } catch {
    const { headers } = clearAuthCookies()
    return NextResponse.json(
      { error: "Refresh failed" },
      { status: 500, headers },
    )
  }
}
