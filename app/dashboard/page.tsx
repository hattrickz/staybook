'use client'

import { useAuthStore } from '@/lib/store/auth'
import { Navbar } from '@/components/layout/Navbar'
import { CalendarDays, Clock, CheckCircle, XCircle, Building2, LayoutDashboard, Heart, Settings } from 'lucide-react'
import Link from 'next/link'
import { cn, formatDate, formatPrice, BOOKING_STATUS_CONFIG } from '@/lib/utils'
import type { Booking, BookingStatus } from '@/types'

// Mock bookings — replace with useQuery(GET_MY_BOOKINGS)
const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'BK001', userId: '1', roomId: '1', hotelId: '1',
    hotel: { id: '1', name: 'Transcorp Hilton Abuja', location: 'Abuja, Nigeria', images: [] } as any,
    room: { id: '1', name: 'Deluxe King Room', roomType: 'deluxe' } as any,
    checkIn: '2026-07-10', checkOut: '2026-07-13',
    guests: 2, nights: 3, totalPrice: 450000, currency: 'NGN',
    status: 'confirmed', createdAt: '2026-06-20T10:00:00Z', confirmationCode: 'SB-2026-4821',
  },
  {
    id: 'BK002', userId: '1', roomId: '2', hotelId: '2',
    hotel: { id: '2', name: 'Eko Hotel & Suites', location: 'Lagos, Nigeria', images: [] } as any,
    room: { id: '2', name: 'Standard Suite', roomType: 'suite' } as any,
    checkIn: '2026-05-05', checkOut: '2026-05-07',
    guests: 1, nights: 2, totalPrice: 190000, currency: 'NGN',
    status: 'checked_out', createdAt: '2026-04-20T10:00:00Z', confirmationCode: 'SB-2026-3301',
  },
]

const STATS = [
  { label: 'Total stays', value: '4', icon: Building2 },
  { label: 'Upcoming', value: '1', icon: CalendarDays },
  { label: 'Completed', value: '3', icon: CheckCircle },
  { label: 'Cancelled', value: '0', icon: XCircle },
]

const NAV = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Bookings', href: '/dashboard/bookings', icon: CalendarDays },
  { label: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
  { label: 'Settings', href: '/dashboard/profile', icon: Settings },
]

export default function DashboardPage() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-surface-tertiary">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="card p-3 sticky top-24">
              <div className="px-3 py-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand font-semibold mb-2">
                  {user?.name?.[0] ?? 'U'}
                </div>
                <p className="font-medium text-ink-primary text-sm">{user?.name}</p>
                <p className="text-xs text-ink-tertiary">{user?.email}</p>
              </div>
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-secondary hover:bg-surface-secondary hover:text-ink-primary transition-colors"
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0 space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-ink-primary">
                Good morning, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-ink-secondary text-sm mt-1">Here's your travel overview</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATS.map((s) => (
                <div key={s.label} className="card p-4">
                  <div className="flex items-center gap-2 text-ink-tertiary text-xs mb-2">
                    <s.icon size={14} />
                    {s.label}
                  </div>
                  <div className="text-2xl font-semibold text-ink-primary">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Recent bookings */}
            <div className="card">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="font-semibold text-ink-primary">Recent bookings</h2>
                <Link href="/dashboard/bookings" className="text-sm text-brand hover:underline">
                  View all
                </Link>
              </div>
              <div className="divide-y divide-border">
                {MOCK_BOOKINGS.map((b) => {
                  const cfg = BOOKING_STATUS_CONFIG[b.status]
                  return (
                    <div key={b.id} className="p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-secondary flex items-center justify-center text-xl shrink-0">
                        🏨
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-ink-primary text-sm truncate">{b.hotel?.name}</p>
                        <p className="text-xs text-ink-tertiary mt-0.5">
                          {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.nights} nights · {b.room?.name}
                        </p>
                        <p className="text-xs text-ink-tertiary">#{b.confirmationCode}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className="badge text-xs"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                        <p className="text-sm font-medium text-ink-primary mt-1">
                          {formatPrice(b.totalPrice, b.currency)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
