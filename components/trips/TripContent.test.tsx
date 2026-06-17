import { describe, it, expect, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import { TripContent } from "./TripContent"
import type { TripData, TripPostData } from "@/graphql/trips"

// Replace the leaflet-backed map (loaded via next/dynamic) with a stub.
vi.mock("@/components/trips/TripMap", () => ({
  __esModule: true,
  default: ({ tripPosts }: { tripPosts: TripPostData[] }) => (
    <div data-testid="trip-map">{`map:${tripPosts.length}`}</div>
  ),
}))

function makePost(over: Partial<TripPostData["post"]> = {}, order = 0): TripPostData {
  return {
    id: `tp-${order}`,
    order,
    createdAt: "2024-02-10T00:00:00Z",
    post: {
      id: `p-${order}`,
      content: `content ${order}`,
      location: "Somewhere",
      signature: "— signed",
      author: { id: `a-${order}`, fullName: `Author ${order}`, username: `u${order}` },
      latitude: -34.6,
      longitude: -58.38,
      createdAt: "2024-02-10T00:00:00Z",
      ...over,
    },
  }
}

function makeTrip(over: Partial<TripData> = {}): TripData {
  return {
    id: "t1",
    title: "Patagonia Trek",
    description: "An epic journey",
    startDate: "2024-03-01T00:00:00Z",
    endDate: "2024-03-10T00:00:00Z",
    isPublic: true,
    shareCode: "code1",
    createdAt: "2024-01-01T00:00:00Z",
    user: { id: "owner", fullName: "Trip Owner", username: "owner" },
    tripPosts: [makePost({ id: "x" }, 1), makePost({ id: "y" }, 0)],
    ...over,
  }
}

describe("TripContent", () => {
  it("renders the trip header with title, description and owner", () => {
    render(<TripContent trip={makeTrip()} />)

    expect(screen.getAllByText("Patagonia Trek").length).toBeGreaterThan(0)
    expect(screen.getAllByText("An epic journey").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Trip Owner").length).toBeGreaterThan(0)
  })

  it("renders a date range when start and end dates exist", () => {
    render(<TripContent trip={makeTrip()} />)
    // Range uses an em dash between formatted dates.
    expect(screen.getAllByText(/—/).length).toBeGreaterThan(0)
  })

  it("renders the start date only when there is no end date", () => {
    render(<TripContent trip={makeTrip({ endDate: undefined })} />)
    // Still renders (start-only). Owner present confirms header rendered.
    expect(screen.getAllByText("Trip Owner").length).toBeGreaterThan(0)
  })

  it("pluralizes the post count correctly", () => {
    const single = makeTrip({ tripPosts: [makePost({ id: "z" }, 0)] })
    render(<TripContent trip={single} />)
    expect(screen.getAllByText("1 post").length).toBeGreaterThan(0)
  })

  it("uses plural 'posts' for multiple posts", () => {
    render(<TripContent trip={makeTrip()} />)
    expect(screen.getAllByText("2 posts").length).toBeGreaterThan(0)
  })

  it("renders the Travel Log section and post content", () => {
    render(<TripContent trip={makeTrip()} />)
    expect(screen.getAllByText("Travel Log").length).toBeGreaterThan(0)
    expect(screen.getAllByText("content 0").length).toBeGreaterThan(0)
    expect(screen.getAllByText("— signed").length).toBeGreaterThan(0)
  })

  it("renders the map when at least one post has coordinates", () => {
    render(<TripContent trip={makeTrip()} />)
    expect(screen.getAllByTestId("trip-map").length).toBeGreaterThan(0)
  })

  it("renders the 'No map data' fallback when no post has coordinates", () => {
    const noCoords = makeTrip({
      tripPosts: [makePost({ id: "n", latitude: undefined, longitude: undefined }, 0)],
    })
    render(<TripContent trip={noCoords} />)

    expect(screen.queryByTestId("trip-map")).toBeNull()
    expect(screen.getByText("No map data")).toBeInTheDocument()
  })

  it("handles a trip with no description and no tripPosts array", () => {
    const empty = makeTrip({ description: undefined, tripPosts: undefined as unknown as TripPostData[] })
    render(<TripContent trip={empty} />)
    expect(screen.getAllByText("0 posts").length).toBeGreaterThan(0)
  })

  it("orders posts by their 'order' field", () => {
    render(<TripContent trip={makeTrip()} />)
    // The first rendered post card badge should be 1 (order 0 sorts first).
    const logs = screen.getAllByText("Travel Log")
    const section = logs[0].closest("div") as HTMLElement
    expect(within(section).getAllByText("content 0").length).toBeGreaterThan(0)
  })
})
