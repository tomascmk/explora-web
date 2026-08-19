import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET || "",
)

const publicPrefixes = [
  "/login",
  "/register",
  // PLAN-071 §2C — la solicitud para ser guía la hace un TOURIST, que por
  // definición todavía no tiene el rol que exige el portal. Si no estuviera
  // acá, el middleware lo rebotaría justo en la pantalla que necesita.
  "/guide-application",
  "/guides",
  "/tourists",
  "/trip",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Exact match for root, prefix match for other public paths
  const isPublicPath =
    pathname === "/" ||
    publicPrefixes.some((prefix) => pathname.startsWith(prefix))
  if (isPublicPath) {
    return NextResponse.next()
  }

  const token = request.cookies.get("authToken")?.value

  if (!token) {
    return redirectToLogin(request, pathname)
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    if (!payload.exp || payload.exp * 1000 < Date.now()) {
      return redirectToLogin(request, pathname)
    }

    // Web portal is for guides (and admins)
    const roles = (payload.roles as string[]) ?? []
    if (
      !roles.includes("GUIDE") &&
      !roles.includes("ADMIN") &&
      !roles.includes("SUPER_ADMIN")
    ) {
      return redirectToLogin(request, pathname)
    }

    return NextResponse.next()
  } catch {
    return redirectToLogin(request, pathname)
  }
}

function redirectToLogin(
  request: NextRequest,
  pathname: string,
): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = "/login"
  url.searchParams.set("redirect", pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
