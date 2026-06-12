import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.API_URL || "http://localhost:3001"

export async function POST(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const response = await fetch(`${API_URL}/auth/ws-ticket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to get ticket" },
        { status: 500 },
      )
    }

    const data = await response.json()
    return NextResponse.json({ ticket: data.ticket })
  } catch {
    return NextResponse.json(
      { error: "Failed to get ticket" },
      { status: 500 },
    )
  }
}
