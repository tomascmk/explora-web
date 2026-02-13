'use client'

import { ApolloProvider } from '@apollo/client/react'
import { getApolloClient } from '@/lib/apollo/client'
import { ReactNode } from 'react'

export function ApolloWrapper({ children }: { children: ReactNode }) {
  const client = getApolloClient()
  if (!client) return <>{children}</>
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
