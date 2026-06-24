import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
})

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('staybook_token')
    : null

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
      if (message === 'Unauthorized') {
        localStorage.removeItem('staybook_token')
        window.location.href = '/auth/login'
      }
    })
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
  }
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          hotels: {
            keyArgs: ['search'],
            merge(existing = [], incoming) {
              return [...existing, ...incoming]
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-and-network' },
  },
})
