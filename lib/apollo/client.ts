"use client"

import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client/core"
import { CombinedGraphQLErrors } from "@apollo/client/errors"
import { onError } from "@apollo/client/link/error"

// Same-origin proxy — no CORS issues, no token management
const httpLink = createHttpLink({
  uri: "/api/graphql",
  credentials: "same-origin",
})

const errorLink = onError(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, path }) => {
      console.error(`[GraphQL error]: ${message} (path: ${path})`)
    })
  } else {
    console.error("[Network error]:", error?.message ?? error)
  }
})

let _apolloClient: InstanceType<typeof ApolloClient> | null = null

export function getApolloClient(): InstanceType<typeof ApolloClient> | null {
  if (typeof window === "undefined") return null
  if (!_apolloClient) {
    _apolloClient = new ApolloClient({
      link: from([errorLink, httpLink]),
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: { fetchPolicy: "cache-and-network" },
      },
    })
  }
  return _apolloClient
}

export const apolloClient =
  typeof window !== "undefined"
    ? getApolloClient()!
    : (null as unknown as InstanceType<typeof ApolloClient>)
