// ─── User ────────────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'manager' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  createdAt: string
}

// ─── Hotel ───────────────────────────────────────────────────────────────────

export interface Hotel {
  id: string
  name: string
  description: string
  location: string
  city: string
  country: string
  rating: number
  reviewCount: number
  images: string[]
  amenities: Amenity[]
  managerId: string
  priceFrom: number
  currency: string
  featured?: boolean
  coordinates?: { lat: number; lng: number }
  checkInTime?: string
  checkOutTime?: string
  policies?: string[]
}

export type AmenityKey =
  | 'wifi'
  | 'pool'
  | 'gym'
  | 'spa'
  | 'restaurant'
  | 'bar'
  | 'parking'
  | 'airport_shuttle'
  | 'room_service'
  | 'concierge'
  | 'business_center'
  | 'pet_friendly'
  | 'breakfast'
  | 'laundry'
  | 'beach_access'

export interface Amenity {
  key: AmenityKey
  label: string
  icon: string
}

// ─── Room ────────────────────────────────────────────────────────────────────

export type RoomType = 'standard' | 'deluxe' | 'suite' | 'presidential' | 'family'
export type BedType = 'single' | 'double' | 'queen' | 'king' | 'twin'

export interface Room {
  id: string
  hotelId: string
  name: string
  roomType: RoomType
  bedType: BedType
  price: number
  currency: string
  capacity: number
  size: number // sqm
  available: boolean
  images: string[]
  amenities: string[]
  description: string
  refundable: boolean
  breakfastIncluded: boolean
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'checked_out'
  | 'cancelled'

export interface Booking {
  id: string
  userId: string
  roomId: string
  hotelId: string
  hotel?: Hotel
  room?: Room
  checkIn: string
  checkOut: string
  guests: number
  nights: number
  totalPrice: number
  currency: string
  status: BookingStatus
  createdAt: string
  specialRequests?: string
  confirmationCode: string
}

// ─── Review ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string
  userId: string
  hotelId: string
  user?: Pick<User, 'id' | 'name' | 'avatar'>
  rating: number
  title: string
  body: string
  createdAt: string
  categories?: {
    cleanliness: number
    service: number
    location: number
    value: number
  }
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchParams {
  location: string
  checkIn: string
  checkOut: string
  guests: number
  priceMin?: number
  priceMax?: number
  stars?: number[]
  amenities?: AmenityKey[]
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'popular'
  page?: number
}

export interface SearchResult {
  hotels: Hotel[]
  total: number
  page: number
  totalPages: number
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalHotels: number
  totalRooms: number
  activeReservations: number
  monthlyRevenue: number
  occupancyRate: number
  newBookingsToday: number
}

// ─── GraphQL Responses ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  error?: string
}
