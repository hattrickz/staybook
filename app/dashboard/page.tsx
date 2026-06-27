'use client'

import { useAuthStore } from '@/lib/store/auth'
import { Navbar } from '@/components/layout/Navbar'
import {
  CalendarDays, CheckCircle, XCircle,
  Building2, LayoutDashboard, Heart, Settings
} from 'lucide-react'
import Link from 'next/link'
import { cn, formatDate, formatPrice, BOOKING_STATUS_CONFIG } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { Route } from 'next'

interface Booking {
  id: string
  confirmationCode: string
  status: string
  checkIn: string
  checkOut: string
  nights: number
  totalPrice: number
  currency: string
  room: { name: string; roomType: string }
  hotel: { name: string; location: string }
}

const NAV = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Bookings', href: '/dashboard/bookings', icon: CalendarDays },
  { label: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
  { label: 'Settings', href: '/dashboard/profile', icon: Settings },
]

function BookingSkeleton() {
  return (
    <div className="p-5 flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-surface-tertiary shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-surface-tertiary rounded w-1/2" />
        <div className="h-3 bg-surface-tertiary rounded w-1/3" />
      </div>
      <div className="w-20 h-6 bg-surface-tertiary rounded" />
    </div>
  )
}

export default function DashboardPage() {
  const { user, token } = useAuthStore()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }

    fetch('http://localhost:4000/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `query {
          myBookings {
            id
            confirmationCode
            status
            checkIn
            checkOut
            nights
            totalPrice
            currency
            room { name roomType }
          }
        }`,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        setBookings(d.data?.myBookings ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token])

  const stats = [
    { label: 'Total stays', value: bookings.length, icon: Building2 },
    { label: 'Upcoming', value: bookings.filter((b) => b.status === 'confirmed').length, icon: CalendarDays },
    { label: 'Completed', value: bookings.filter((b) => b.status === 'checked_out').length, icon: CheckCircle },
    { label: 'Cancelled', value: bookings.filter((b) => b.status === 'cancelled').length, icon: XCircle },
  ]

  return (
    <div className="min-h-screen bg-surface-tertiary">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="card p-3 sticky top-24">
              <div className="px-3 py-3 mb-2 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand font-semibold mb-2">
                  {user?.name?.[0] ?? 'U'}
                </div>
                <p className="font-medium text-ink-primary text-sm">{user?.name}</p>
                <p className="text-xs text-ink-tertiary">{user?.email}</p>
              </div>
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href as Route}
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
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
                {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-ink-secondary text-sm mt-1">Here's your travel overview</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="card p-4">
                  <div className="flex items-center gap-2 text-ink-tertiary text-xs mb-2">
                    <s.icon size={14} />
                    {s.label}
                  </div>
                  <div className="text-2xl font-semibold text-ink-primary">
                    {loading ? '—' : s.value}
                  </div>
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
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <BookingSkeleton key={i} />)
                ) : bookings.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-3xl mb-3">🏨</p>
                    <p className="font-medium text-ink-primary text-sm mb-1">No bookings yet</p>
                    <p className="text-xs text-ink-tertiary mb-4">
                      Your upcoming and past stays will appear here
                    </p>
                    <Link href="/hotels" className="btn-primary text-sm">
                      Browse hotels
                    </Link>
                  </div>
                ) : (
                  bookings.map((b) => {
                    const cfg = BOOKING_STATUS_CONFIG[b.status as keyof typeof BOOKING_STATUS_CONFIG]
                      ?? { label: b.status, color: '#6B7280', bg: '#F3F4F6' }
                    return (
                      <div key={b.id} className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-surface-secondary flex items-center justify-center text-xl shrink-0">
                          🏨
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-ink-primary text-sm truncate">
                            {b.room?.name}
                          </p>
                          <p className="text-xs text-ink-tertiary mt-0.5">
                            {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.nights} nights
                          </p>
                          <p className="text-xs text-ink-tertiary">#{b.confirmationCode}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className="badge text-xs px-2 py-0.5 rounded-md font-medium"
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
                  })
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/hotels" className="card p-5 flex items-center gap-4 hover:shadow-elevated transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand shrink-0">
                  🔍
                </div>
                <div>
                  <p className="font-medium text-ink-primary text-sm">Find a hotel</p>
                  <p className="text-xs text-ink-tertiary mt-0.5">Browse thousands of properties</p>
                </div>
              </Link>
              <Link href="/dashboard/bookings" className="card p-5 flex items-center gap-4 hover:shadow-elevated transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  📋
                </div>
                <div>
                  <p className="font-medium text-ink-primary text-sm">Manage bookings</p>
                  <p className="text-xs text-ink-tertiary mt-0.5">View, modify or cancel stays</p>
                </div>
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}