import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, waitFor, act } from "@testing-library/react"
import { useRouter } from "next/navigation"

// Control the feature-flags query result.
const useQueryMock = vi.fn(() => ({ data: undefined }))
vi.mock("@apollo/client/react", () => ({
  useQuery: () => useQueryMock(),
}))

import { AuthProvider, useAuth } from "./AuthContext"

function Consumer() {
  const { user, loading, isAuthenticated, featureFlags, login, logout } =
    useAuth()
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="auth">{String(isAuthenticated)}</span>
      <span data-testid="username">{user?.username ?? "none"}</span>
      <span data-testid="chat">{String(featureFlags.chatEnabled)}</span>
      <span data-testid="tours">{String(featureFlags.tourCreationEnabled)}</span>
      <button onClick={() => login("e@x.com", "pw")}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  )
}

function renderProvider() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>,
  )
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useQueryMock.mockReturnValue({ data: undefined })
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("useAuth throws outside of an AuthProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => render(<Consumer />)).toThrow(/within AuthProvider/)
  })

  it("rehydrates the session from /api/auth/me on mount", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ user: { id: "1", username: "alice" } }),
      }),
    )

    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId("loading")).toHaveTextContent("false"),
    )
    expect(screen.getByTestId("auth")).toHaveTextContent("true")
    expect(screen.getByTestId("username")).toHaveTextContent("alice")
  })

  it("stays unauthenticated when /api/auth/me is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))

    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId("loading")).toHaveTextContent("false"),
    )
    expect(screen.getByTestId("auth")).toHaveTextContent("false")
  })

  it("stays unauthenticated when /api/auth/me throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")))

    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId("loading")).toHaveTextContent("false"),
    )
    expect(screen.getByTestId("auth")).toHaveTextContent("false")
  })

  it("exposes safe default feature flags before flags load", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }))

    renderProvider()

    await waitFor(() =>
      expect(screen.getByTestId("loading")).toHaveTextContent("false"),
    )
    expect(screen.getByTestId("chat")).toHaveTextContent("false")
    expect(screen.getByTestId("tours")).toHaveTextContent("true")
  })

  it("login posts credentials, sets the user and updates feature flags", async () => {
    // First call: /api/auth/me (unauthenticated). Second: /api/auth/login.
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { id: "1", username: "bob" } }),
      })
    vi.stubGlobal("fetch", fetchSpy)
    // After login a user exists -> FeatureFlagsLoader mounts; return flags.
    useQueryMock.mockReturnValue({
      data: { featureFlags: { chatEnabled: true, tourCreationEnabled: false } },
    })

    renderProvider()
    await waitFor(() =>
      expect(screen.getByTestId("loading")).toHaveTextContent("false"),
    )

    await act(async () => {
      screen.getByText("login").click()
    })

    await waitFor(() =>
      expect(screen.getByTestId("username")).toHaveTextContent("bob"),
    )
    // flags hydrated from the query via the loader callback
    await waitFor(() =>
      expect(screen.getByTestId("chat")).toHaveTextContent("true"),
    )
    expect(screen.getByTestId("tours")).toHaveTextContent("false")

    const loginCall = fetchSpy.mock.calls.find((c) => c[0] === "/api/auth/login")
    expect(loginCall).toBeTruthy()
    expect(JSON.parse(loginCall![1].body)).toEqual({
      email: "e@x.com",
      password: "pw",
    })
  })

  it("login throws with the backend error when the response is not ok", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({ ok: false }) // /me
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Invalid credentials" }),
      })
    vi.stubGlobal("fetch", fetchSpy)

    let captured: unknown
    function LoginCatcher() {
      const { login } = useAuth()
      return (
        <button
          onClick={async () => {
            try {
              await login("e@x.com", "bad")
            } catch (e) {
              captured = e
            }
          }}
        >
          go
        </button>
      )
    }

    render(
      <AuthProvider>
        <LoginCatcher />
      </AuthProvider>,
    )

    await act(async () => {
      screen.getByText("go").click()
    })

    await waitFor(() => expect(captured).toBeInstanceOf(Error))
    expect((captured as Error).message).toBe("Invalid credentials")
  })

  it("logout clears the user and redirects to /login", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { id: "1", username: "alice" } }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
    vi.stubGlobal("fetch", fetchSpy)

    renderProvider()
    await waitFor(() =>
      expect(screen.getByTestId("username")).toHaveTextContent("alice"),
    )

    await act(async () => {
      screen.getByText("logout").click()
    })

    await waitFor(() =>
      expect(screen.getByTestId("username")).toHaveTextContent("none"),
    )
    const router = useRouter()
    expect(router.push).toHaveBeenCalledWith("/login")
  })

  it("logout still clears the user when the logout request throws", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { id: "1", username: "alice" } }),
      })
      .mockRejectedValueOnce(new Error("down"))
    vi.stubGlobal("fetch", fetchSpy)

    renderProvider()
    await waitFor(() =>
      expect(screen.getByTestId("username")).toHaveTextContent("alice"),
    )

    await act(async () => {
      screen.getByText("logout").click()
    })

    await waitFor(() =>
      expect(screen.getByTestId("username")).toHaveTextContent("none"),
    )
  })
})
