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
  { id: "1", title: "City Walk", latitude: 40.7, longitude: -74, price: 30, currency: "EUR", rating: 4.5 },
  { id: "2", title: "Food Tour", latitude: 40.71, longitude: -74.01, price: 20, currency: "ARS" },
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

/**
 * PLAN-122 — El popup decía `Precio: $undefined`.
 *
 * `Tour` no tiene `price` en el esquema: la página del mapa lo declaraba en su
 * interfaz local, la query nunca lo pedía, y `useQuery<{ toursByGuide: Tour[] }>`
 * se lo creía. El precio vive en `tourPricings`. Encima el `$` era fijo, así que
 * un tour en euros se anunciaba en dólares.
 */
describe("InteractiveMap — la moneda del popup", () => {
  const popupFor = async (tour: Record<string, unknown>) => {
    const L = (await import("leaflet")).default;
    cleanup();
    vi.clearAllMocks();
    render(<InteractiveMap tours={[tour as never]} />);
    void L;
    return markerInstance.bindPopup.mock.calls[0][0] as string;
  };

  it("no anuncia un tour en euros con el signo de dólar", async () => {
    const popup = await popupFor({
      id: "1",
      title: "City Walk",
      latitude: 40.7,
      longitude: -74,
      price: 30,
      currency: "EUR",
    });

    expect(popup).toContain("30");
    expect(popup).not.toContain("$");
  });

  it("nunca escribe `undefined` como precio", async () => {
    // El caso real: sin `tourPricings` el precio llega en 0, no indefinido.
    const popup = await popupFor({
      id: "2",
      title: "Sin precio",
      latitude: 40.7,
      longitude: -74,
      price: 0,
      currency: null,
    });

    expect(popup).not.toContain("undefined");
    expect(popup).toContain("Precio: 0");
  });
});
