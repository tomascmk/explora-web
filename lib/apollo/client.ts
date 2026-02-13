'use client'

import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/graphql'

// HTTP link
const httpLink = createHttpLink({
  uri: API_URL,
  credentials: 'include'
})

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
      // Refresh failed, clear tokens
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
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

// Error link for handling 401 and refreshing tokens
const errorLink = onError((errorResponse: any) => {
  const { graphQLErrors, networkError, operation, forward } = errorResponse;
  
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // Check if error is authentication related
      if (err.extensions?.code === 'UNAUTHENTICATED' || err.message === 'Unauthorized') {
        // Try to refresh the token and retry
        refreshAccessToken().then((newToken) => {
          if (newToken) {
            // Retry the failed request with new token
            const oldHeaders = operation.getContext().headers;
            operation.setContext({
              headers: {
                ...oldHeaders,
                authorization: `Bearer ${newToken}`,
              },
            });
          }
        });
        // Don't return anything, let the error propagate
        return;
      }
    }
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

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
