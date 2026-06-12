import { NextResponse } from "next/server"
import { clearAuthCookies } from "@/lib/auth/cookies"

export async function POST() {
  const { headers } = clearAuthCookies()
  return NextResponse.json({ success: true }, { status: 200, headers })
}
