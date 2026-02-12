'use client'

import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { Observable } from '@apollo/client/utilities'

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
      if (err.extensions?.code === 'UNAUTHENTICATED' || err.message === 'Unauthorized') {
        return new Observable((observer) => {
          refreshAccessToken()
            .then((newToken) => {
              if (newToken) {
                const headers = operation.getContext().headers || {};
                operation.setContext({
                  headers: {
                    ...headers,
                    authorization: `Bearer ${newToken}`,
                  },
                });
              }
              forward(operation).subscribe(observer);
            })
            .catch((e) => observer.error(e));
        });
      }
    }
  }

  if (networkError) {
    console.error(`[Network error]:`, networkError);
  }

  return forward(operation);
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

// Apollo Client instance
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network'
    }
  }
})
