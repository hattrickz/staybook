import { prisma } from '../lib/prisma'
import { requireAuth, requireRole, type Context } from '../middleware/auth'

export const hotelResolvers = {
    Query: {
        hotels: async (_: any, { search }: any) => {
            const where: any = {}

            if (search?.location) {
                where.OR = [
                    { city: { contains: search.location, mode: 'insensitive' } },
                    { country: { contains: search.location, mode: 'insensitive' } },
                    { location: { contains: search.location, mode: 'insensitive' } },
                ]
            }
            if (search?.priceMin !== undefined) where.priceFrom = { gte: search.priceMin }
            if (search?.priceMax !== undefined) where.priceFrom = { ...where.priceFrom, lte: search.priceMax }

            const orderBy: any =
                search?.sortBy === 'price_asc' ? { priceFrom: 'asc' } :
                    search?.sortBy === 'price_desc' ? { priceFrom: 'desc' } :
                        search?.sortBy === 'rating' ? { rating: 'desc' } :
                            { featured: 'desc' }

            return prisma.hotel.findMany({ where, orderBy, include: { rooms: true, reviews: true } })
        },

        hotel: async (_: any, { id }: any) => {
            return prisma.hotel.findUnique({
                where: { id },
                include: {
                    rooms: true,
                    reviews: true,
                },
            })
        },

        featuredHotels: async () => {
            return prisma.hotel.findMany({
                where: { featured: true },
                take: 8,
                include: { rooms: true },
            })
        },

        managerHotels: async (_: any, __: any, context: Context) => {
            const { userId } = requireRole(context, 'manager')
            return prisma.hotel.findMany({
                where: { managerId: userId },
                include: { rooms: true, reviews: true },
            })
        },

        dashboardStats: async (_: any, __: any, context: Context) => {
            const { userId } = requireRole(context, 'manager')

            const hotels = await prisma.hotel.findMany({ where: { managerId: userId } })
            const hotelIds = hotels.map((h) => h.id)

            const rooms = await prisma.room.findMany({ where: { hotelId: { in: hotelIds } } })

            const now = new Date()
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

            const activeBookings = await prisma.booking.count({
                where: {
                    room: { hotelId: { in: hotelIds } },
                    status: { in: ['confirmed', 'checked_in'] },
                },
            })

            const revenueAgg = await prisma.booking.aggregate({
                where: {
                    room: { hotelId: { in: hotelIds } },
                    status: { not: 'cancelled' },
                    createdAt: { gte: startOfMonth },
                },
                _sum: { totalPrice: true },
            })

            const occupiedRooms = rooms.filter((r) => !r.available).length

            return {
                totalHotels: hotels.length,
                totalRooms: rooms.length,
                activeReservations: activeBookings,
                monthlyRevenue: revenueAgg._sum.totalPrice ?? 0,
                occupancyRate: rooms.length ? Math.round((occupiedRooms / rooms.length) * 100) : 0,
                newBookingsToday: 0,
            }
        },
    },

    Mutation: {
        createHotel: async (_: any, { input }: any, context: Context) => {
            const { userId } = requireRole(context, 'manager')
            return prisma.hotel.create({
                data: { ...input, managerId: userId, amenities: input.amenities },
                include: { rooms: true },
            })
        },
    },

    Hotel: {
        amenities: (hotel: any) => {
            if (Array.isArray(hotel.amenities)) return hotel.amenities
            return []
        },
    },
}