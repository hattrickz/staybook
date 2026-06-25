import 'dotenv/config'
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { typeDefs } from './schema'
import { resolvers } from './resolvers'
import { getContext } from './middleware/auth'

async function main() {
    const server = new ApolloServer({ typeDefs, resolvers })

    const { url } = await startStandaloneServer(server, {
        listen: { port: Number(process.env.PORT) || 4000 },
        context: getContext,
    })

    console.log(`🚀 GraphQL server ready at ${url}`)
    console.log(`📊 GraphQL Playground: ${url}graphql`)
}

main().catch(console.error)