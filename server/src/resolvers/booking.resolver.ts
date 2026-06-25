import { prisma } from '../lib/prisma'
import { requireAuth, type Context } from '../middleware/auth'
import { differenceInDays, parseISO } from 'date-fns'

function generateCode(): string {
    return 'SB-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)
}

export const bookingResolvers = {
    Query: {
        myBookings: async (_: any, __: any, context: Context) => {
            const { userId } = requireAuth(context)
            return prisma.booking.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                include: { room: { include: { hotel: true } } },
            })
        },

        booking: async (_: any, { id }: any, context: Context) => {
            const { userId } = requireAuth(context)
            const booking = await prisma.booking.findUnique({
                where: { id },
                include: { room: { include: { hotel: true } }, user: true },
            })
            if (!booking || booking.userId !== userId) throw new Error('Not found')
            return booking
        },
    },

    Mutation: {
        createBooking: async (_: any, { input }: any, context: Context) => {
            const { userId } = requireAuth(context)

            const room = await prisma.room.findUnique({ where: { id: input.roomId } })
            if (!room) throw new Error('Room not found')
            if (!room.available) throw new Error('Room is not available')

            const checkIn = parseISO(input.checkIn)
            const checkOut = parseISO(input.checkOut)
            const nights = differenceInDays(checkOut, checkIn)
            if (nights < 1) throw new Error('Check-out must be after check-in')

            const totalPrice = room.price * nights

            const booking = await prisma.booking.create({
                data: {
                    userId,
                    roomId: input.roomId,
                    checkIn,
                    checkOut,
                    guests: input.guests,
                    nights,
                    totalPrice,
                    currency: room.currency,
                    status: 'confirmed',
                    confirmationCode: generateCode(),
                    specialRequests: input.specialRequests,
                },
                include: { room: { include: { hotel: true } }, user: true },
            })

            return booking
        },

        cancelBooking: async (_: any, { id }: any, context: Context) => {
            const { userId } = requireAuth(context)
            const booking = await prisma.booking.findUnique({ where: { id } })
            if (!booking || booking.userId !== userId) throw new Error('Not found')
            if (booking.status === 'checked_in') throw new Error('Cannot cancel an active stay')

            return prisma.booking.update({ where: { id }, data: { status: 'cancelled' } })
        },
    },

    Booking: {
        hotel: async (booking: any) => {
            if (booking.room?.hotel) return booking.room.hotel
            const room = await prisma.room.findUnique({
                where: { id: booking.roomId },
                include: { hotel: true },
            })
            return room?.hotel ?? null
        },
        room: async (booking: any) => {
            if (booking.room) return booking.room
            return prisma.room.findUnique({ where: { id: booking.roomId } })
        },
        checkIn: (b: any) => b.checkIn.toISOString().split('T')[0],
        checkOut: (b: any) => b.checkOut.toISOString().split('T')[0],
        createdAt: (b: any) => b.createdAt.toISOString(),
    },
}