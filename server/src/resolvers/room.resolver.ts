import { prisma } from '../lib/prisma'
import { requireRole, type Context } from '../middleware/auth'

export const roomResolvers = {
    Mutation: {
        createRoom: async (_: any, { input }: any, context: Context) => {
            requireRole(context, 'manager')
            return prisma.room.create({ data: input })
        },

        updateRoomAvailability: async (_: any, { id, available }: any, context: Context) => {
            requireRole(context, 'manager')
            return prisma.room.update({ where: { id }, data: { available } })
        },
    },
}