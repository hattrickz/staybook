import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { signToken } from '../lib/jwt'
import { requireAuth, type Context } from '../middleware/auth'

export const userResolvers = {
    Query: {
        me: async (_: any, __: any, context: Context) => {
            const { userId } = requireAuth(context)
            return prisma.user.findUnique({ where: { id: userId } })
        },
    },

    Mutation: {
        register: async (_: any, { input }: any) => {
            const existing = await prisma.user.findUnique({ where: { email: input.email } })
            if (existing) throw new Error('Email already in use')

            const password = await bcrypt.hash(input.password, 12)
            const user = await prisma.user.create({
                data: {
                    name: input.name,
                    email: input.email,
                    password,
                    role: input.role || 'customer',
                },
            })

            const token = signToken({ userId: user.id, role: user.role })
            return { token, user }
        },

        login: async (_: any, { email, password }: any) => {
            const user = await prisma.user.findUnique({ where: { email } })
            if (!user) throw new Error('Invalid email or password')

            const valid = await bcrypt.compare(password, user.password)
            if (!valid) throw new Error('Invalid email or password')

            const token = signToken({ userId: user.id, role: user.role })
            return { token, user }
        },
    },
}