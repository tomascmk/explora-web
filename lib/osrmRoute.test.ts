import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getWalkingRoute } from "./osrmRoute"

describe("getWalkingRoute", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns the single point without calling the API when given <2 waypoints", async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)

    const result = await getWalkingRoute([{ latitude: 1, longitude: 2 }])

    expect(result).toEqual([[1, 2]])
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it("returns an empty array for no waypoints", async () => {
    const result = await getWalkingRoute([])
    expect(result).toEqual([])
  })

  it("requests OSRM with lon,lat order and converts geometry to [lat, lng]", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      json: async () => ({
        code: "Ok",
        routes: [
          {
            geometry: {
              coordinates: [
                [2, 1],
                [4, 3],
              ],
            },
          },
        ],
      }),
    })
    vi.stubGlobal("fetch", fetchSpy)

    const result = await getWalkingRoute([
      { latitude: 1, longitude: 2 },
      { latitude: 3, longitude: 4 },
    ])

    // converted back to [lat, lng]
    expect(result).toEqual([
      [1, 2],
      [3, 4],
    ])
    const calledUrl = fetchSpy.mock.calls[0][0] as string
    // OSRM uses lon,lat order in the path
    expect(calledUrl).toContain("/2,1;4,3")
    expect(calledUrl).toContain("geometries=geojson")
  })

  it("falls back to straight lines when the API returns a non-Ok code", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: async () => ({ code: "NoRoute" }) }),
    )

    const result = await getWalkingRoute([
      { latitude: 1, longitude: 2 },
      { latitude: 3, longitude: 4 },
    ])

    expect(result).toEqual([
      [1, 2],
      [3, 4],
    ])
    expect(console.warn).toHaveBeenCalled()
  })

  it("falls back to straight lines when geometry is missing", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ json: async () => ({ code: "Ok", routes: [] }) }),
    )

    const result = await getWalkingRoute([
      { latitude: 1, longitude: 2 },
      { latitude: 3, longitude: 4 },
    ])

    expect(result).toEqual([
      [1, 2],
      [3, 4],
    ])
  })

  it("falls back to straight lines when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")))

    const result = await getWalkingRoute([
      { latitude: 1, longitude: 2 },
      { latitude: 3, longitude: 4 },
    ])

    expect(result).toEqual([
      [1, 2],
      [3, 4],
    ])
    expect(console.error).toHaveBeenCalled()
  })
})
