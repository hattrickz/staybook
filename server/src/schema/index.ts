export const typeDefs = `#graphql

  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    avatar: String
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Amenity {
    key: String!
    label: String!
    icon: String!
  }

  type Coordinates {
    lat: Float!
    lng: Float!
  }

  type Hotel {
    id: ID!
    name: String!
    description: String!
    location: String!
    city: String!
    country: String!
    rating: Float!
    reviewCount: Int!
    images: [String!]!
    amenities: [Amenity!]!
    priceFrom: Float!
    currency: String!
    featured: Boolean!
    checkInTime: String
    checkOutTime: String
    policies: [String!]!
    rooms: [Room!]!
    reviews: [Review!]!
  }

  type Room {
    id: ID!
    hotelId: ID!
    name: String!
    roomType: String!
    bedType: String!
    price: Float!
    currency: String!
    capacity: Int!
    size: Float!
    available: Boolean!
    images: [String!]!
    amenities: [String!]!
    description: String!
    refundable: Boolean!
    breakfastIncluded: Boolean!
  }

  type Booking {
    id: ID!
    checkIn: String!
    checkOut: String!
    guests: Int!
    nights: Int!
    totalPrice: Float!
    currency: String!
    status: String!
    confirmationCode: String!
    specialRequests: String
    createdAt: String!
    hotel: Hotel
    room: Room
    user: User
  }

  type Review {
    id: ID!
    userId: ID!
    hotelId: ID!
    rating: Float!
    title: String!
    body: String!
    createdAt: String!
    user: User
    categories: ReviewCategories
  }

  type ReviewCategories {
    cleanliness: Float!
    service: Float!
    location: Float!
    value: Float!
  }

  type DashboardStats {
    totalHotels: Int!
    totalRooms: Int!
    activeReservations: Int!
    monthlyRevenue: Float!
    occupancyRate: Float!
    newBookingsToday: Int!
  }

  input SearchInput {
    location: String
    checkIn: String
    checkOut: String
    guests: Int
    priceMin: Float
    priceMax: Float
    stars: [Int]
    sortBy: String
    page: Int
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
    role: String
  }

  input CreateBookingInput {
    roomId: ID!
    checkIn: String!
    checkOut: String!
    guests: Int!
    specialRequests: String
  }

  input CreateHotelInput {
    name: String!
    description: String!
    location: String!
    city: String!
    country: String!
    images: [String!]!
    amenities: [AmenityInput!]!
    priceFrom: Float!
    currency: String
    checkInTime: String
    checkOutTime: String
    policies: [String!]
  }

  input AmenityInput {
    key: String!
    label: String!
    icon: String!
  }

  input CreateRoomInput {
    hotelId: ID!
    name: String!
    roomType: String!
    bedType: String!
    price: Float!
    currency: String
    capacity: Int!
    size: Float!
    images: [String!]!
    amenities: [String!]!
    description: String!
    refundable: Boolean
    breakfastIncluded: Boolean
  }

  type Query {
    me: User
    hotels(search: SearchInput): [Hotel!]!
    hotel(id: ID!): Hotel
    featuredHotels: [Hotel!]!
    myBookings: [Booking!]!
    booking(id: ID!): Booking
    dashboardStats: DashboardStats!
    managerHotels: [Hotel!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createBooking(input: CreateBookingInput!): Booking!
    cancelBooking(id: ID!): Booking!
    createHotel(input: CreateHotelInput!): Hotel!
    createRoom(input: CreateRoomInput!): Room!
    updateRoomAvailability(id: ID!, available: Boolean!): Room!
  }
`