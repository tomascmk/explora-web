'use client'

import { ApolloClient, InMemoryCache, createHttpLink, from, Observable } from '@apollo/client/core'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/graphql'

// HTTP link
const httpLink = createHttpLink({
  uri: API_URL,
  credentials: 'include'
})

// Prevent multiple concurrent refresh attempts
let isRefreshing = false
let pendingRequests: Array<(token: string) => void> = []

const resolvePendingRequests = (token: string) => {
  pendingRequests.forEach((resolve) => resolve(token))
  pendingRequests = []
}

const rejectPendingRequests = () => {
  pendingRequests = []
}

const forceLogout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

// Refresh token function
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation RefreshToken($refreshToken: String!) {
            refreshToken(refreshToken: $refreshToken) {
              access_token
              refresh_token
              user {
                id
                username
                email
                roles
                fullName
              }
            }
          }
        `,
        variables: { refreshToken }
      })
    });

    const { data, errors } = await response.json();

    if (errors || !data?.refreshToken) {
      return null;
    }

    // Store new tokens
    localStorage.setItem('authToken', data.refreshToken.access_token);
    localStorage.setItem('refreshToken', data.refreshToken.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.refreshToken.user));

    return data.refreshToken.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
};

// Helper: check if an error contains UNAUTHENTICATED GraphQL errors
function hasUnauthenticatedError(error: any): boolean {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.some(
      (err) =>
        err.extensions?.code === 'UNAUTHENTICATED' ||
        err.message === 'Unauthorized' ||
        (err.extensions?.originalError as any)?.statusCode === 401
    )
  }
  if (error && typeof error === 'object' && 'statusCode' in error) {
    return (error as any).statusCode === 401
  }
  if (error?.message) {
    const msg = String(error.message).toLowerCase()
    return msg.includes('unauthorized') || msg.includes('unauthenticated')
  }
  return false
}

// Error link for handling auth errors with automatic token refresh and retry (Apollo Client v4 API)
const errorLink = onError(({ error, operation, forward }) => {
  const isUnauthenticated = hasUnauthenticatedError(error)

  if (isUnauthenticated) {
    // Don't try to refresh if the failing operation IS the refresh mutation
    if (operation.operationName === 'RefreshToken') {
      forceLogout()
      return
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Observable((observer) => {
        pendingRequests.push((newToken: string) => {
          const oldHeaders = operation.getContext().headers
          operation.setContext({
            headers: {
              ...oldHeaders,
              authorization: `Bearer ${newToken}`
            }
          })
          forward(operation).subscribe(observer)
        })
      })
    }

    isRefreshing = true

    return new Observable((observer) => {
      refreshAccessToken()
        .then((newToken) => {
          if (newToken) {
            const oldHeaders = operation.getContext().headers
            operation.setContext({
              headers: {
                ...oldHeaders,
                authorization: `Bearer ${newToken}`
              }
            })
            resolvePendingRequests(newToken)
            forward(operation).subscribe(observer)
          } else {
            rejectPendingRequests()
            forceLogout()
            observer.error(error)
          }
        })
        .catch((refreshError) => {
          rejectPendingRequests()
          forceLogout()
          observer.error(refreshError)
        })
        .finally(() => {
          isRefreshing = false
        })
    })
  }

  // Log non-auth errors
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}`)
    })
  } else {
    console.error(`[Network/other error]:`, error?.message || error)
  }
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

// Apollo Client: creado solo en el cliente para evitar 500 en SSR (next start)
let _apolloClient: InstanceType<typeof ApolloClient> | null = null
export function getApolloClient(): InstanceType<typeof ApolloClient> | null {
  if (typeof window === 'undefined') return null
  if (!_apolloClient) {
    _apolloClient = new ApolloClient({
      link: from([errorLink, authLink, httpLink]),
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'cache-and-network'
        }
      }
    })
  }
  return _apolloClient
}
// Para compatibilidad: en cliente devuelve el client; en servidor null (no usar en servidor)
export const apolloClient = typeof window !== 'undefined' ? getApolloClient()! : (null as any)
