"use client"

import { useRouter } from "next/navigation"
import { useQuery } from "@apollo/client/react"
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import {
  FEATURE_FLAGS,
  type FeatureFlags,
  type FeatureFlagsData,
} from "@/graphql/feature-flags"

interface User {
  id: string
  username: string
  email: string
  roles: string[]
  fullName?: string
}

// Safe defaults while the flags load or the request fails: everything ON
// except chat (gated subsystem, PLAN-037). Mirrors the app store.
const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  tourCreationEnabled: true,
  discountGroupsEnabled: true,
  claimsEnabled: true,
  reviewsEnabled: true,
  selfGuidedToursEnabled: true,
  inPersonToursEnabled: true,
  chatEnabled: false,
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  featureFlags: FeatureFlags
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mounted only when authenticated (client-side), so the query never runs during
// SSR/prerender where there is no ApolloProvider. Reports flags up via callback.
function FeatureFlagsLoader({
  onLoaded,
}: {
  onLoaded: (flags: FeatureFlags) => void
}) {
  const { data } = useQuery<FeatureFlagsData>(FEATURE_FLAGS)
  useEffect(() => {
    if (data?.featureFlags) {
      onLoaded(data.featureFlags)
    }
  }, [data, onLoaded])
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Rehydrate session on mount via /api/auth/me
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch {
        // Not authenticated
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Feature flags hydrate once the session is established. The query is mounted
  // only when a user exists, so it never runs during SSR/prerender (where no
  // ApolloProvider is available); flags fall back to safe defaults until then.
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(
    DEFAULT_FEATURE_FLAGS
  )

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "Login failed")
    }

    setUser(data.user)
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // Best effort
    }
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        featureFlags,
        login,
        logout,
        setUser,
      }}
    >
      {user && <FeatureFlagsLoader onLoaded={setFeatureFlags} />}
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
