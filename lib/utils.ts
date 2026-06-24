import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInDays, parseISO } from 'date-fns'
import type { AmenityKey, BookingStatus, RoomType } from '@/types'

// ─── Tailwind ─────────────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Dates ────────────────────────────────────────────────────────────────────

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt)
}

export function nightsBetween(checkIn: string, checkOut: string) {
  return differenceInDays(parseISO(checkOut), parseISO(checkIn))
}

export function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export function tomorrowISO() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatPrice(amount: number, currency = 'NGN') {
  const symbols: Record<string, string> = {
    NGN: '₦',
    USD: '$',
    GBP: '£',
    EUR: '€',
    AED: 'AED ',
    JPY: '¥',
  }
  const symbol = symbols[currency] ?? currency + ' '
  return `${symbol}${amount.toLocaleString()}`
}

// ─── Ratings ──────────────────────────────────────────────────────────────────

export function starsArray(rating: number) {
  return Array.from({ length: 5 }, (_, i) => i < Math.round(rating))
}

export function ratingLabel(rating: number) {
  if (rating >= 4.8) return 'Exceptional'
  if (rating >= 4.5) return 'Excellent'
  if (rating >= 4.0) return 'Very Good'
  if (rating >= 3.5) return 'Good'
  return 'Fair'
}

// ─── Room ─────────────────────────────────────────────────────────────────────

export const ROOM_TYPE_LABELS: Record<RoomType, string> = {
  standard: 'Standard Room',
  deluxe: 'Deluxe Room',
  suite: 'Suite',
  presidential: 'Presidential Suite',
  family: 'Family Room',
}

// ─── Booking Status ───────────────────────────────────────────────────────────

export const BOOKING_STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; color: string; bg: string }
> = {
  pending:     { label: 'Pending',     color: '#B45309', bg: '#FEF3C7' },
  confirmed:   { label: 'Confirmed',   color: '#065F46', bg: '#D1FAE5' },
  checked_in:  { label: 'Checked In',  color: '#1E40AF', bg: '#DBEAFE' },
  checked_out: { label: 'Checked Out', color: '#6B7280', bg: '#F3F4F6' },
  cancelled:   { label: 'Cancelled',   color: '#991B1B', bg: '#FEE2E2' },
}

// ─── Amenities ────────────────────────────────────────────────────────────────

export const AMENITY_CONFIG: Record<AmenityKey, { label: string; icon: string }> = {
  wifi:            { label: 'Free WiFi',       icon: 'Wifi' },
  pool:            { label: 'Swimming Pool',   icon: 'Waves' },
  gym:             { label: 'Fitness Center',  icon: 'Dumbbell' },
  spa:             { label: 'Spa',             icon: 'Sparkles' },
  restaurant:      { label: 'Restaurant',      icon: 'UtensilsCrossed' },
  bar:             { label: 'Bar & Lounge',    icon: 'Wine' },
  parking:         { label: 'Free Parking',    icon: 'Car' },
  airport_shuttle: { label: 'Airport Shuttle', icon: 'Bus' },
  room_service:    { label: 'Room Service',    icon: 'Bell' },
  concierge:       { label: 'Concierge',       icon: 'BriefcaseBusiness' },
  business_center: { label: 'Business Center', icon: 'Building2' },
  pet_friendly:    { label: 'Pet Friendly',    icon: 'PawPrint' },
  breakfast:       { label: 'Breakfast',       icon: 'Coffee' },
  laundry:         { label: 'Laundry',         icon: 'WashingMachine' },
  beach_access:    { label: 'Beach Access',    icon: 'Umbrella' },
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('staybook_token')
}

export function setToken(token: string) {
  localStorage.setItem('staybook_token', token)
}

export function removeToken() {
  localStorage.removeItem('staybook_token')
}
