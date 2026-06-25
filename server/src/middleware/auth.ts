import { verifyToken, type TokenPayload } from '../lib/jwt'

export interface Context {
    user: TokenPayload | null
}

export function getContext({ req }: { req: any }): Context {
    const auth = req.headers.authorization || ''

    if (!auth.startsWith('Bearer ')) return { user: null }

    try {
        const token = auth.replace('Bearer ', '')
        const user = verifyToken(token)
        return { user }
    } catch {
        return { user: null }
    }
}

export function requireAuth(context: Context): TokenPayload {
    if (!context.user) throw new Error('Unauthorized')
    return context.user
}

export function requireRole(context: Context, role: string): TokenPayload {
    const user = requireAuth(context)
    if (user.role !== role && user.role !== 'admin') {
        throw new Error('Forbidden')
    }
    return user
}