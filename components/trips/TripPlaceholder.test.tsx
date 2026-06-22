import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { TripPlaceholder } from "./TripPlaceholder"

describe("TripPlaceholder", () => {
  it("renders the blurred, non-interactive placeholder shell", () => {
    const { container } = render(<TripPlaceholder />)

    const root = container.firstElementChild as HTMLElement
    expect(root).toHaveClass("pointer-events-none")
    expect(root).toHaveClass("select-none")
  })

  it("renders four placeholder post cards (numbered 1-4)", () => {
    const { getAllByText } = render(<TripPlaceholder />)

    // Placeholder post card index badges + duplicated desktop/mobile layouts.
    expect(getAllByText("1").length).toBeGreaterThan(0)
    expect(getAllByText("4").length).toBeGreaterThan(0)
  })

  it("renders the fake map with numbered markers", () => {
    const { getAllByText } = render(<TripPlaceholder />)

    // Map markers numbered 1, 2, 3 — present in both desktop and mobile layouts.
    expect(getAllByText("2").length).toBeGreaterThan(0)
    expect(getAllByText("3").length).toBeGreaterThan(0)
  })

  it("renders an SVG polyline overlay on the fake map", () => {
    const { container } = render(<TripPlaceholder />)
    expect(container.querySelectorAll("svg line").length).toBeGreaterThan(0)
  })
})
