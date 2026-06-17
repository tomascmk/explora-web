import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { getApolloClient, apolloClient } from "./client"

describe("apollo client", () => {
  it("returns a singleton client in a browser-like env", () => {
    const a = getApolloClient()
    const b = getApolloClient()
    expect(a).not.toBeNull()
    expect(a).toBe(b)
  })

  it("exposes the eagerly-created apolloClient instance", () => {
    expect(apolloClient).toBeTruthy()
    expect(apolloClient).toBe(getApolloClient())
  })

  it("client exposes a query method", () => {
    const client = getApolloClient()
    expect(typeof client?.query).toBe("function")
  })

  it("configures cache-and-network as the default watchQuery policy", () => {
    const client = getApolloClient()
    expect(client?.defaultOptions.watchQuery?.fetchPolicy).toBe(
      "cache-and-network",
    )
  })

  it("uses an InMemoryCache instance", () => {
    const client = getApolloClient()
    // extract() is specific to InMemoryCache; presence confirms cache wiring.
    expect(typeof client?.cache.extract).toBe("function")
  })
})

// The error link's onError callback is a private closure inside client.ts.
// We capture it by mocking onError to record the callback, then re-import the
// module so it registers our spy, and finally invoke the callback for each
// branch (combined GraphQL errors vs. plain network error).
describe("apollo error link callback", () => {
  let errorCallback: ((arg: { error: unknown }) => void) | undefined
  let consoleError: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    vi.resetModules()
    errorCallback = undefined
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {})

    vi.doMock("@apollo/client/link/error", () => ({
      onError: (cb: (arg: { error: unknown }) => void) => {
        errorCallback = cb
        return { concat: () => ({}), request: () => null }
      },
    }))

    await import("./client")
  })

  afterEach(() => {
    consoleError.mockRestore()
    vi.doUnmock("@apollo/client/link/error")
    vi.resetModules()
  })

  it("logs each GraphQL error from a CombinedGraphQLErrors instance", async () => {
    const { CombinedGraphQLErrors } = await import("@apollo/client/errors")
    const combined = new CombinedGraphQLErrors({
      errors: [{ message: "boom", path: ["field"] }],
    } as never)

    errorCallback?.({ error: combined })

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining("[GraphQL error]: boom"),
    )
  })

  it("logs a network error for non-GraphQL failures", () => {
    errorCallback?.({ error: new Error("network down") })
    expect(consoleError).toHaveBeenCalledWith("[Network error]:", "network down")
  })

  it("logs the raw error when it has no message", () => {
    errorCallback?.({ error: undefined })
    expect(consoleError).toHaveBeenCalledWith("[Network error]:", undefined)
  })
})
