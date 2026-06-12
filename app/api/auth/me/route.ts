import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

if (!process.env.JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET environment variable is required")
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET)

export async function GET(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value

  if (!token) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 },
    )
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    return NextResponse.json({
      user: {
        id: payload.sub,
        username: payload.username,
        email: payload.email,
        roles: payload.roles ?? [],
        fullName: payload.fullName ?? null,
      },
    })
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
