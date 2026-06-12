import { NextRequest, NextResponse } from "next/server"
import { getApiUrl, setAuthCookies } from "@/lib/auth/cookies"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation Login($email: String!, $password: String!) {
            login(loginInput: { email: $email, password: $password }) {
              access_token
              refresh_token
              user { id username email roles fullName }
            }
          }
        `,
        variables: { email, password },
      }),
    })

    const result = await response.json()

    if (result.errors) {
      return NextResponse.json(
        { error: result.errors[0].message },
        { status: 401 },
      )
    }

    const { access_token, refresh_token, user } = result.data.login
    const { headers } = setAuthCookies(access_token, refresh_token)

    return NextResponse.json({ user }, { status: 200, headers })
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
