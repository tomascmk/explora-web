import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { InteractiveMap } from "./InteractiveMap";

// Leaflet (+ markercluster + CSS) need real DOM/canvas, so stub the whole
// imperative API with spies we can assert against.
const mapInstance = {
  setView: vi.fn().mockReturnThis(),
  addLayer: vi.fn(),
  removeLayer: vi.fn(),
  fitBounds: vi.fn(),
  remove: vi.fn(),
};

const clusterGroup = {
  addLayer: vi.fn(),
  getBounds: vi.fn(() => ({ isValid: () => true })),
};

const markerInstance = { bindPopup: vi.fn().mockReturnThis() };

vi.mock("leaflet", () => {
  const tileLayer = vi.fn(() => ({ addTo: vi.fn() }));
  return {
    default: {
      map: vi.fn(() => mapInstance),
      tileLayer,
      markerClusterGroup: vi.fn(() => clusterGroup),
      divIcon: vi.fn(() => ({})),
      marker: vi.fn(() => markerInstance),
    },
  };
});
vi.mock("leaflet.markercluster", () => ({}));
vi.mock("leaflet/dist/leaflet.css", () => ({}));
vi.mock("leaflet.markercluster/dist/MarkerCluster.css", () => ({}));
vi.mock("leaflet.markercluster/dist/MarkerCluster.Default.css", () => ({}));

const tours = [
  { id: "1", title: "City Walk", latitude: 40.7, longitude: -74, price: 30, rating: 4.5 },
  { id: "2", title: "Food Tour", latitude: 40.71, longitude: -74.01, price: 20 },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("InteractiveMap", () => {
  it("renders a map container element", () => {
    const { container } = render(<InteractiveMap tours={[]} />);
    expect(container.querySelector("div.relative.z-0")).toBeTruthy();
  });

  it("initializes the leaflet map and adds a tile layer", async () => {
    const L = (await import("leaflet")).default;
    render(<InteractiveMap tours={[]} />);
    expect(L.map).toHaveBeenCalled();
    expect(mapInstance.setView).toHaveBeenCalled();
    expect(L.tileLayer).toHaveBeenCalled();
  });

  it("adds a marker per tour and fits bounds", async () => {
    const L = (await import("leaflet")).default;
    render(<InteractiveMap tours={tours} />);
    expect(L.marker).toHaveBeenCalledTimes(2);
    expect(clusterGroup.addLayer).toHaveBeenCalledTimes(2);
    expect(mapInstance.fitBounds).toHaveBeenCalled();
  });

  it("does not fit bounds when there are no tours", () => {
    render(<InteractiveMap tours={[]} />);
    expect(mapInstance.fitBounds).not.toHaveBeenCalled();
  });

  it("invokes onTourClick when a tour-click event fires", () => {
    const onTourClick = vi.fn();
    render(<InteractiveMap tours={tours} onTourClick={onTourClick} />);
    window.dispatchEvent(new CustomEvent("tour-click", { detail: "1" }));
    expect(onTourClick).toHaveBeenCalledWith("1");
  });

  it("cleans up the map on unmount", () => {
    const { unmount } = render(<InteractiveMap tours={tours} />);
    unmount();
    expect(mapInstance.remove).toHaveBeenCalled();
  });

  it("uses a custom center and zoom when provided", async () => {
    const L = (await import("leaflet")).default;
    cleanup();
    vi.clearAllMocks();
    render(<InteractiveMap tours={[]} center={[10, 20]} zoom={5} />);
    expect(mapInstance.setView).toHaveBeenCalledWith([10, 20], 5);
    expect(L.map).toHaveBeenCalled();
  });
});
