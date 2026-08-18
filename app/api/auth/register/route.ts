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
        // PLAN-071 §2A — `RegisterInput` no declara `roles`, asi que mandarlo
        // hacia rechazar la mutation entera y el registro estaba caido para
        // todos. La API asigna TOURIST siempre (AuthService.register ->
        // createTourist); el rol no es negociable desde el cliente. Los roles
        // se gestionan con la mutation admin-guarded `setUserRoles`.
        variables: {
          input: {
            username: body.username,
            email: body.email,
            fullName: body.fullName,
            password: body.password,
            confirmPassword: body.confirmPassword,
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
