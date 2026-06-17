import { describe, it, expect } from "vitest"
import { theme } from "./theme"

describe("theme", () => {
  it("exposes the primary teal palette", () => {
    expect(theme.colors.primary).toBe("#14B8A6")
    expect(theme.colors.primaryHover).toBe("#0D9488")
  })

  it("exposes a sidebar palette", () => {
    expect(theme.colors.sidebar.bg).toBe("#0F172A")
    expect(theme.colors.sidebar.active).toBe(theme.colors.primary)
  })

  it("provides a chart series array", () => {
    expect(Array.isArray(theme.charts.series)).toBe(true)
    expect(theme.charts.series.length).toBeGreaterThan(0)
    expect(theme.charts.series[0]).toBe(theme.charts.primary)
  })

  it("maps every status key to a bg/text pair", () => {
    for (const [, value] of Object.entries(theme.status)) {
      expect(value).toHaveProperty("bg")
      expect(value).toHaveProperty("text")
      expect(value.bg).toMatch(/^#[0-9A-F]{6}$/i)
      expect(value.text).toMatch(/^#[0-9A-F]{6}$/i)
    }
  })

  it("includes the expected nested text/bg tokens", () => {
    expect(theme.colors.text.heading).toBe("#0F172A")
    expect(theme.colors.bg.page).toBe("#F8FAFC")
  })
})
