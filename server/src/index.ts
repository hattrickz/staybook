import 'dotenv/config'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import express from 'express'
import http from 'http'
import cors from 'cors'
import { typeDefs } from './schema'
import { resolvers } from './resolvers'
import { getContext } from './middleware/auth'

async function main() {
    const app = express()
    const httpServer = http.createServer(app)

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: true,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    })

    await server.start()

    app.use(
        '/',
        cors<cors.CorsRequest>({
            origin: [
                'http://localhost:3000',
                'https://staybook-nine.vercel.app',
                /\.vercel\.app$/,
                /\.railway\.app$/,
            ],
            credentials: true,
        }),
        express.json(),
        expressMiddleware(server, { context: getContext }),
    )

    const PORT = Number(process.env.PORT) || 4000
    await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve))
    console.log(`🚀 GraphQL server ready at http://localhost:${PORT}`)
}

main().catch(console.error)