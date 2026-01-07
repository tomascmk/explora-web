'use client'

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/graphql'

// HTTP link
const httpLink = createHttpLink({
  uri: API_URL,
  credentials: 'include'
})

// Auth link
const authLink = setContext((_, { headers }) => {
  // Get token from cookie or localStorage
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  }
})

// Apollo Client instance
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network'
    }
  }
})
