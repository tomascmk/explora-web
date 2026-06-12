import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import { setAuthCookies } from "@/lib/auth/cookies"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || "",
)

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken } = await request.json()

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: "Missing tokens" },
        { status: 400 },
      )
    }

    // Verify the access token is valid before setting cookies
    const { payload } = await jwtVerify(accessToken, JWT_SECRET)

    const { headers } = setAuthCookies(accessToken, refreshToken)

    return NextResponse.json(
      {
        user: {
          id: payload.sub,
          username: payload.username,
          email: payload.email,
          roles: payload.roles ?? [],
          fullName: payload.fullName ?? null,
        },
      },
      { status: 200, headers },
    )
  } catch {
    return NextResponse.json(
      { error: "Invalid tokens" },
      { status: 401 },
    )
  }
}
