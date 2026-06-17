import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TourCreationMap } from "./TourCreationMap";
import type { PlaceSummary } from "@/components/tours/PlaceSearchAutocomplete";

// react-leaflet needs real layout/canvas; replace its primitives with simple
// host elements that still render children and wire event handlers.
let mapClickHandler: ((e: { latlng: { lat: number; lng: number } }) => void) | undefined;
vi.mock("react-leaflet", async () => {
  const React = await import("react");
  return {
    MapContainer: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", { "data-testid": "map" }, children),
    TileLayer: () => null,
    Marker: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", { "data-testid": "marker" }, children),
    CircleMarker: ({
      children,
      eventHandlers,
    }: {
      children: React.ReactNode;
      eventHandlers?: { click?: () => void };
    }) =>
      React.createElement(
        "div",
        { "data-testid": "circle", onClick: () => eventHandlers?.click?.() },
        children,
      ),
    Popup: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", null, children),
    Polyline: () => React.createElement("div", { "data-testid": "polyline" }),
    useMapEvents: (handlers: {
      click?: (e: { latlng: { lat: number; lng: number } }) => void;
    }) => {
      mapClickHandler = handlers.click;
      return null;
    },
  };
});

vi.mock("leaflet", () => ({
  default: {
    Icon: { Default: { prototype: {}, mergeOptions: vi.fn() } },
  },
}));

vi.mock("@/lib/osrmRoute", () => ({
  getWalkingRoute: vi.fn().mockResolvedValue([
    [-34.6, -58.38],
    [-34.61, -58.39],
  ]),
}));

const waypoint = {
  id: "wp1",
  latitude: -34.6,
  longitude: -58.38,
  title: "Stop 1",
  description: "desc",
  order: 0,
  placeName: "Plaza",
};

const place: PlaceSummary = {
  id: "pl1",
  name: "Obelisco",
  address: {
    id: "a1",
    city: "Buenos Aires",
    country: "Argentina",
    latitude: -34.6,
    longitude: -58.38,
  },
};

describe("TourCreationMap", () => {
  it("renders the map and instructions after mount", async () => {
    render(
      <TourCreationMap
        waypoints={[]}
        onWaypointAdd={vi.fn()}
        onWaypointRemove={vi.fn()}
      />,
    );
    expect(await screen.findByTestId("map")).toBeInTheDocument();
    expect(screen.getByText("How to add stops:")).toBeInTheDocument();
  });

  it("renders a marker and popup for each waypoint", async () => {
    render(
      <TourCreationMap
        waypoints={[waypoint]}
        onWaypointAdd={vi.fn()}
        onWaypointRemove={vi.fn()}
      />,
    );
    await screen.findByTestId("map");
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Stop 1")).toBeInTheDocument();
    expect(screen.getByText("Linked: Plaza")).toBeInTheDocument();
  });

  it("invokes onWaypointAdd when the map is clicked", async () => {
    const onWaypointAdd = vi.fn();
    render(
      <TourCreationMap
        waypoints={[]}
        onWaypointAdd={onWaypointAdd}
        onWaypointRemove={vi.fn()}
      />,
    );
    await screen.findByTestId("map");
    mapClickHandler?.({ latlng: { lat: 1, lng: 2 } });
    expect(onWaypointAdd).toHaveBeenCalledWith(1, 2);
  });

  it("invokes onWaypointRemove from the waypoint popup", async () => {
    const onWaypointRemove = vi.fn();
    const user = userEvent.setup();
    render(
      <TourCreationMap
        waypoints={[waypoint]}
        onWaypointAdd={vi.fn()}
        onWaypointRemove={onWaypointRemove}
      />,
    );
    await screen.findByTestId("map");
    await user.click(screen.getByText("Remove"));
    expect(onWaypointRemove).toHaveBeenCalledWith("wp1");
  });

  it("renders nearby places and adds one as a stop on click", async () => {
    const onPlaceClick = vi.fn();
    const user = userEvent.setup();
    render(
      <TourCreationMap
        waypoints={[]}
        onWaypointAdd={vi.fn()}
        onWaypointRemove={vi.fn()}
        nearbyPlaces={[place]}
        onPlaceClick={onPlaceClick}
      />,
    );
    await screen.findByTestId("map");
    expect(screen.getByText("Obelisco")).toBeInTheDocument();
    await user.click(screen.getByText("Add as stop"));
    expect(onPlaceClick).toHaveBeenCalledWith(place);
  });

  it("fetches the walking route when there are at least two waypoints", async () => {
    const { getWalkingRoute } = await import("@/lib/osrmRoute");
    render(
      <TourCreationMap
        waypoints={[
          waypoint,
          { ...waypoint, id: "wp2", order: 1, latitude: -34.61 },
        ]}
        onWaypointAdd={vi.fn()}
        onWaypointRemove={vi.fn()}
      />,
    );
    await screen.findByTestId("map");
    await waitFor(() => expect(getWalkingRoute).toHaveBeenCalled());
  });
});
