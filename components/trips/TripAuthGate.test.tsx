import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TripAuthGate } from "./TripAuthGate"

// ── Mocks ──

const authState = {
  isAuthenticated: false,
  loading: false,
  setUser: vi.fn(),
}
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}))

let queryResult: { data?: unknown; loading: boolean; error?: unknown } = {
  data: undefined,
  loading: false,
}
vi.mock("@apollo/client/react", () => ({
  useQuery: () => queryResult,
}))

vi.mock("./TripContent", () => ({
  TripContent: ({ trip }: { trip: { title: string } }) => (
    <div data-testid="trip-content">{trip.title}</div>
  ),
}))

vi.mock("./TripPlaceholder", () => ({
  TripPlaceholder: () => <div data-testid="trip-placeholder" />,
}))

const trip = {
  id: "t1",
  title: "Authed Trip",
  isPublic: true,
  shareCode: "code1",
  createdAt: "2024-01-01",
  user: { id: "u", fullName: "Owner", username: "owner" },
  tripPosts: [],
}

function resetState() {
  authState.isAuthenticated = false
  authState.loading = false
  authState.setUser = vi.fn()
  queryResult = { data: undefined, loading: false }
}

// Tab buttons and submit buttons share labels ("Sign In" / "Create Account").
// Only the submit button carries an explicit `type="submit"` attribute and
// lives inside a <form>; the tab buttons have no type attribute.
function submitButton(name: RegExp) {
  return screen
    .getAllByRole("button", { name })
    .find(
      (b) =>
        b.getAttribute("type") === "submit" && b.closest("form") !== null,
    ) as HTMLButtonElement
}

// jsdom blocks requestSubmit() when native `required` constraints flag invalid,
// so submit the form directly to exercise the handler deterministically.
function submitForm(name: RegExp) {
  const form = submitButton(name).closest("form") as HTMLFormElement
  fireEvent.submit(form)
}

describe("TripAuthGate", () => {
  beforeEach(() => {
    resetState()
    vi.restoreAllMocks()
  })

  it("shows a loading spinner while auth is resolving", () => {
    authState.loading = true
    render(<TripAuthGate shareCode="code1" />)
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("shows the auth modal + placeholder when not authenticated", () => {
    render(<TripAuthGate shareCode="code1" />)
    expect(screen.getByTestId("trip-placeholder")).toBeInTheDocument()
    expect(screen.getByText("Sign in to view this trip")).toBeInTheDocument()
    // Login tab is active by default → submit button present.
    expect(submitButton(/Sign In/)).toBeInTheDocument()
  })

  it("renders a loading state for the authenticated trip query", () => {
    authState.isAuthenticated = true
    queryResult = { data: undefined, loading: true }
    render(<TripAuthGate shareCode="code1" />)
    expect(screen.getByText("Loading trip...")).toBeInTheDocument()
  })

  it("renders a 'Trip Not Found' state on query error", () => {
    authState.isAuthenticated = true
    queryResult = { data: undefined, loading: false, error: new Error("boom") }
    render(<TripAuthGate shareCode="code1" />)
    expect(screen.getByText("Trip Not Found")).toBeInTheDocument()
  })

  it("renders 'Trip Not Found' when query returns no trip", () => {
    authState.isAuthenticated = true
    queryResult = { data: { tripByShareCode: null }, loading: false }
    render(<TripAuthGate shareCode="code1" />)
    expect(screen.getByText("Trip Not Found")).toBeInTheDocument()
  })

  it("renders the trip content when authenticated and data present", () => {
    authState.isAuthenticated = true
    queryResult = { data: { tripByShareCode: trip }, loading: false }
    render(<TripAuthGate shareCode="code1" />)
    expect(screen.getByTestId("trip-content")).toHaveTextContent("Authed Trip")
  })

  // ── Login form ──

  it("submits the login form and stores the user on success", async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: "1" } }),
    })
    vi.stubGlobal("fetch", fetchMock)

    render(<TripAuthGate shareCode="code1" />)

    await user.type(screen.getByPlaceholderText("you@example.com"), "a@b.com")
    await user.type(screen.getByPlaceholderText("••••••••"), "secret123")
    submitForm(/Sign In/)

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/auth/login",
        expect.objectContaining({ method: "POST" }),
      ),
    )
    await waitFor(() => expect(authState.setUser).toHaveBeenCalledWith({ id: "1" }))
  })

  it("shows an error message when login fails", async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Bad credentials" }),
      }),
    )

    render(<TripAuthGate shareCode="code1" />)

    await user.type(screen.getByPlaceholderText("you@example.com"), "a@b.com")
    await user.type(screen.getByPlaceholderText("••••••••"), "x")
    submitForm(/Sign In/)

    expect(await screen.findByText("Bad credentials")).toBeInTheDocument()
  })

  it("triggers OAuth redirect with stored return url", async () => {
    const user = userEvent.setup()
    const setItem = vi.fn()
    vi.stubGlobal("sessionStorage", { setItem, getItem: vi.fn() })
    // Avoid jsdom "Not implemented: navigation" noise on href assignment.
    const originalLocation = window.location
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, href: "http://test/trip" },
    })

    render(<TripAuthGate shareCode="code1" />)
    await user.click(screen.getByRole("button", { name: "Google" }))

    expect(setItem).toHaveBeenCalledWith("oauth_return_url", expect.any(String))

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    })
  })

  // ── Register form ──

  it("switches to the register tab and back", async () => {
    const user = userEvent.setup()
    render(<TripAuthGate shareCode="code1" />)

    await user.click(screen.getByRole("button", { name: "Create Account" }))
    expect(screen.getByPlaceholderText("johndoe")).toBeInTheDocument()

    // The in-form "Sign In" link switches back to login.
    const links = screen.getAllByRole("button", { name: "Sign In" })
    await user.click(links[links.length - 1])
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument()
  })

  it("validates that passwords match on register", async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    render(<TripAuthGate shareCode="code1" />)
    await user.click(screen.getByRole("button", { name: "Create Account" }))

    await user.type(screen.getByPlaceholderText("johndoe"), "john")
    await user.type(screen.getByPlaceholderText("John Doe"), "John Doe")
    await user.type(screen.getByPlaceholderText("you@example.com"), "j@d.com")
    const [pw, confirm] = screen.getAllByPlaceholderText("••••••••")
    await user.type(pw, "Password1!")
    await user.type(confirm, "Different1!")
    submitForm(/Create Account/)

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("validates minimum password length on register", async () => {
    const user = userEvent.setup()
    render(<TripAuthGate shareCode="code1" />)
    await user.click(screen.getByRole("button", { name: "Create Account" }))

    await user.type(screen.getByPlaceholderText("johndoe"), "john")
    await user.type(screen.getByPlaceholderText("John Doe"), "John Doe")
    await user.type(screen.getByPlaceholderText("you@example.com"), "j@d.com")
    const [pw, confirm] = screen.getAllByPlaceholderText("••••••••")
    await user.type(pw, "short")
    await user.type(confirm, "short")
    submitForm(/Create Account/)

    expect(
      await screen.findByText("Password must be at least 8 characters"),
    ).toBeInTheDocument()
  })

  it("submits a valid registration and stores the user", async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { id: "9" } }),
    })
    vi.stubGlobal("fetch", fetchMock)

    render(<TripAuthGate shareCode="code1" />)
    await user.click(screen.getByRole("button", { name: "Create Account" }))

    await user.type(screen.getByPlaceholderText("johndoe"), "john")
    await user.type(screen.getByPlaceholderText("John Doe"), "John Doe")
    await user.type(screen.getByPlaceholderText("you@example.com"), "j@d.com")
    const [pw, confirm] = screen.getAllByPlaceholderText("••••••••")
    await user.type(pw, "Password1!")
    await user.type(confirm, "Password1!")
    submitForm(/Create Account/)

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/auth/register",
        expect.objectContaining({ method: "POST" }),
      ),
    )
    await waitFor(() => expect(authState.setUser).toHaveBeenCalledWith({ id: "9" }))
  })

  it("shows a server error message on failed registration", async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Email taken" }),
      }),
    )

    render(<TripAuthGate shareCode="code1" />)
    await user.click(screen.getByRole("button", { name: "Create Account" }))

    await user.type(screen.getByPlaceholderText("johndoe"), "john")
    await user.type(screen.getByPlaceholderText("John Doe"), "John Doe")
    await user.type(screen.getByPlaceholderText("you@example.com"), "j@d.com")
    const [pw, confirm] = screen.getAllByPlaceholderText("••••••••")
    await user.type(pw, "Password1!")
    await user.type(confirm, "Password1!")
    submitForm(/Create Account/)

    expect(await screen.findByText("Email taken")).toBeInTheDocument()
  })
})
