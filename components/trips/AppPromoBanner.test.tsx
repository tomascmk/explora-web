import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, act, fireEvent } from "@testing-library/react"
import { AppPromoBanner } from "./AppPromoBanner"

const toast = vi.fn()
vi.mock("sonner", () => ({
  toast: (...args: unknown[]) => toast(...args),
}))

function setUserAgent(ua: string) {
  Object.defineProperty(window.navigator, "userAgent", {
    value: ua,
    configurable: true,
  })
}

// jsdom throws "Not implemented: navigation" on location.href assignment;
// replace location with a writable stub so tryOpenApp doesn't blow up.
let locationHref = ""
const originalLocation = window.location

describe("AppPromoBanner", () => {
  beforeEach(() => {
    toast.mockClear()
    locationHref = ""
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...originalLocation,
        get href() {
          return locationHref
        },
        set href(v: string) {
          locationHref = v
        },
      },
    })
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    })
  })

  it("renders nothing initially (no modal, no toast on desktop)", () => {
    setUserAgent("Mozilla/5.0 (Macintosh)")
    const { container } = render(<AppPromoBanner shareCode="abc" />)

    expect(container.firstChild).toBeNull()
    expect(toast).not.toHaveBeenCalled()
  })

  it("shows a toast suggesting the app on mobile user agents", () => {
    setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS)")
    render(<AppPromoBanner shareCode="abc" />)

    expect(toast).toHaveBeenCalledWith(
      "Open in Explora App",
      expect.objectContaining({
        description: expect.any(String),
        action: expect.objectContaining({ label: "Open" }),
      }),
    )
  })

  it("opens the download modal when the deep-link fails to leave the page", () => {
    setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS)")
    // tryOpenApp opens the modal only if >2s elapsed by the time the timer
    // fires; force Date.now to report a large elapsed gap.
    const now = vi.spyOn(Date, "now")
    now.mockReturnValueOnce(0) // start
    now.mockReturnValue(5000) // inside the timeout

    // jsdom: document.hidden defaults to false (page still visible == not opened)
    render(<AppPromoBanner shareCode="trip-xyz" />)

    const action = toast.mock.calls[0][1].action as { onClick: () => void }
    act(() => {
      action.onClick()
      vi.advanceTimersByTime(1600)
    })

    expect(
      screen.getByRole("heading", { name: "Get the Explora App" }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Download on the App Store/)).toBeInTheDocument()
    expect(screen.getByText(/Google Play/)).toBeInTheDocument()
    now.mockRestore()
  })

  it("closes the modal via 'Continue in browser'", async () => {
    setUserAgent("Mozilla/5.0 (Android)")
    const now = vi.spyOn(Date, "now")
    now.mockReturnValueOnce(0)
    now.mockReturnValue(5000)

    render(<AppPromoBanner shareCode="trip-xyz" />)

    const action = toast.mock.calls[0][1].action as { onClick: () => void }
    act(() => {
      action.onClick()
      vi.advanceTimersByTime(1600)
    })
    now.mockRestore()

    expect(
      screen.getByRole("heading", { name: "Get the Explora App" }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByText("Continue in browser"))

    expect(screen.queryByRole("heading", { name: "Get the Explora App" })).toBeNull()
  })

  it("closes the modal when the backdrop is clicked", () => {
    setUserAgent("Mozilla/5.0 (iPhone)")
    const now = vi.spyOn(Date, "now")
    now.mockReturnValueOnce(0)
    now.mockReturnValue(5000)

    const { container } = render(<AppPromoBanner shareCode="trip-xyz" />)
    const action = toast.mock.calls[0][1].action as { onClick: () => void }
    act(() => {
      action.onClick()
      vi.advanceTimersByTime(1600)
    })
    now.mockRestore()

    const backdrop = container.querySelector(".backdrop-blur-sm") as HTMLElement
    fireEvent.click(backdrop)

    expect(
      screen.queryByRole("heading", { name: "Get the Explora App" }),
    ).toBeNull()
  })

  it("does not open the modal when the app successfully opens (document hidden)", () => {
    setUserAgent("Mozilla/5.0 (iPhone)")
    const hiddenSpy = vi
      .spyOn(document, "hidden", "get")
      .mockReturnValue(true)
    render(<AppPromoBanner shareCode="x" />)

    const action = toast.mock.calls[0][1].action as { onClick: () => void }
    act(() => {
      action.onClick()
      vi.advanceTimersByTime(2100)
    })

    expect(screen.queryByRole("heading", { name: "Get the Explora App" })).toBeNull()
    hiddenSpy.mockRestore()
  })
})
