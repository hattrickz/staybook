import { gql } from '@apollo/client'

export const GET_HOTELS = gql`
  query GetHotels($search: SearchInput) {
    hotels(search: $search) {
      id
      name
      description
      location
      city
      country
      rating
      reviewCount
      images
      amenities {
        key
        label
        icon
      }
      priceFrom
      currency
      featured
    }
  }
`

export const GET_HOTEL = gql`
  query GetHotel($id: ID!) {
    hotel(id: $id) {
      id
      name
      description
      location
      city
      country
      rating
      reviewCount
      images
      amenities {
        key
        label
        icon
      }
      priceFrom
      currency
      checkInTime
      checkOutTime
      policies
      coordinates {
        lat
        lng
      }
      rooms {
        id
        name
        roomType
        bedType
        price
        currency
        capacity
        size
        available
        images
        amenities
        description
        refundable
        breakfastIncluded
      }
      reviews {
        id
        rating
        title
        body
        createdAt
        user {
          id
          name
          avatar
        }
        categories {
          cleanliness
          service
          location
          value
        }
      }
    }
  }
`

export const GET_FEATURED_HOTELS = gql`
  query GetFeaturedHotels {
    featuredHotels {
      id
      name
      location
      city
      rating
      reviewCount
      images
      priceFrom
      currency
      amenities {
        key
        label
      }
    }
  }
`

export const GET_MY_BOOKINGS = gql`
  query GetMyBookings {
    myBookings {
      id
      checkIn
      checkOut
      guests
      nights
      totalPrice
      currency
      status
      confirmationCode
      createdAt
      hotel {
        id
        name
        location
        images
      }
      room {
        id
        name
        roomType
      }
    }
  }
`

export const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      role
      avatar
      createdAt
    }
  }
`

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    dashboardStats {
      totalHotels
      totalRooms
      activeReservations
      monthlyRevenue
      occupancyRate
      newBookingsToday
    }
  }
`
