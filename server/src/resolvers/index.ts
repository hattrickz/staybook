import { userResolvers } from './user.resolver'
import { hotelResolvers } from './hotel.resolver'
import { roomResolvers } from './room.resolver'
import { bookingResolvers } from './booking.resolver'

export const resolvers = {
    Query: {
        ...userResolvers.Query,
        ...hotelResolvers.Query,
        ...bookingResolvers.Query,
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...hotelResolvers.Mutation,
        ...roomResolvers.Mutation,
        ...bookingResolvers.Mutation,
    },
    Hotel: hotelResolvers.Hotel,
    Booking: bookingResolvers.Booking,
}