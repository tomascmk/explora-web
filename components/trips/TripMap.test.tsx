import { describe, it, expect, vi } from "vitest"
import type React from "react"
import { render, screen } from "@testing-library/react"
import TripMap from "./TripMap"
import type { TripPostData } from "@/graphql/trips"

// react-leaflet primitives need real layout — replace with host elements that
// still render children so we can assert popup contents.
const fitBounds = vi.fn()
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map">{children}</div>
  ),
  TileLayer: () => null,
  Marker: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="marker">{children}</div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
  Polyline: () => <div data-testid="polyline" />,
  useMap: () => ({ fitBounds }),
}))

vi.mock("leaflet", () => {
  const L = {
    Icon: { Default: { prototype: {}, mergeOptions: vi.fn() } },
    divIcon: vi.fn(() => ({})),
    latLngBounds: vi.fn(() => ({})),
  }
  return { default: L, ...L }
})

function makePost(over: Partial<TripPostData["post"]> = {}, order = 0): TripPostData {
  return {
    id: `tp-${order}-${over.id ?? "x"}`,
    order,
    createdAt: "2024-01-01T00:00:00Z",
    post: {
      id: `p-${order}`,
      content: "Visited a great place",
      location: "Plaza Mayor",
      author: { id: "u1", fullName: "Ada Lovelace", username: "ada" },
      latitude: -34.6,
      longitude: -58.38,
      createdAt: "2024-01-01T00:00:00Z",
      ...over,
    },
  }
}

describe("TripMap", () => {
  it("renders the empty state when no posts have coordinates", () => {
    const posts = [makePost({ id: "a", latitude: undefined, longitude: undefined })]
    render(<TripMap tripPosts={posts} />)

    expect(screen.getByText("No map data available")).toBeInTheDocument()
    expect(screen.queryByTestId("map")).toBeNull()
  })

  it("renders the empty state when given no posts at all", () => {
    render(<TripMap tripPosts={[]} />)
    expect(screen.getByText("No map data available")).toBeInTheDocument()
  })

  it("renders the map, polyline and a marker per geolocated post", () => {
    const posts = [
      makePost({ id: "a" }, 1),
      makePost({ id: "b", latitude: -34.61, longitude: -58.39 }, 0),
    ]
    render(<TripMap tripPosts={posts} style={{ height: 300 }} />)

    expect(screen.getByTestId("map")).toBeInTheDocument()
    expect(screen.getByTestId("polyline")).toBeInTheDocument()
    expect(screen.getAllByTestId("marker")).toHaveLength(2)
  })

  it("calls fitBounds with the post positions", () => {
    fitBounds.mockClear()
    render(<TripMap tripPosts={[makePost({ id: "a" })]} />)
    expect(fitBounds).toHaveBeenCalled()
  })

  it("renders popup author and location for each marker", () => {
    render(<TripMap tripPosts={[makePost({ id: "a" })]} />)

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument()
    expect(screen.getByText("Plaza Mayor")).toBeInTheDocument()
    expect(screen.getByText("Visited a great place")).toBeInTheDocument()
  })

  it("truncates long post content to 120 chars in the popup", () => {
    const long = "a".repeat(200)
    render(<TripMap tripPosts={[makePost({ id: "a", content: long, location: undefined })]} />)

    expect(screen.getByText(`${"a".repeat(120)}...`)).toBeInTheDocument()
  })
})
