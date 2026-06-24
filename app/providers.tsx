'use client'

import { ApolloProvider } from '@apollo/client'
import { Toaster } from 'react-hot-toast'
import { apolloClient } from '@/lib/apollo'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={apolloClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#111827',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '8px',
          },
          success: { iconTheme: { primary: '#1D9E75', secondary: '#fff' } },
        }}
      />
    </ApolloProvider>
  )
}
