import { NextRequest, NextResponse } from "next/server"
import { getApiUrl, setAuthCookies } from "@/lib/auth/cookies"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation Register($input: RegisterInput!) {
            register(registerInput: $input) {
              access_token
              refresh_token
              user { id username email roles fullName }
            }
          }
        `,
        variables: {
          input: {
            username: body.username,
            email: body.email,
            fullName: body.fullName,
            password: body.password,
            confirmPassword: body.confirmPassword,
            roles: body.roles,
          },
        },
      }),
    })

    const result = await response.json()

    if (result.errors) {
      return NextResponse.json(
        { error: result.errors[0].message },
        { status: 400 },
      )
    }

    const { access_token, refresh_token, user } = result.data.register
    const { headers } = setAuthCookies(access_token, refresh_token)

    return NextResponse.json({ user }, { status: 200, headers })
  } catch {
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 },
    )
  }
}
