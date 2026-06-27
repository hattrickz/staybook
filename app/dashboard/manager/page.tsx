'use client'
import type { Route } from 'next'
import { useState } from 'react'
import Link from 'next/link'
import {
    LayoutDashboard, Building2, BedDouble, CalendarCheck,
    BarChart3, Plus, TrendingUp, TrendingDown, Users,
    DollarSign, Star, Eye, Edit, Trash2, CheckCircle,
    XCircle, Clock, ChevronRight, Menu, X
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { cn, formatPrice, formatDate, BOOKING_STATUS_CONFIG } from '@/lib/utils'
import type { Booking, BookingStatus } from '@/types'

// ── Mock data ─────────────────────────────────────────────────────────────────

const STATS = [
    {
        label: 'Total Revenue',
        value: '₦4,820,000',
        change: '+12.5%',
        up: true,
        icon: DollarSign,
        color: 'text-brand',
        bg: 'bg-brand-50',
    },
    {
        label: 'Active Bookings',
        value: '24',
        change: '+3 today',
        up: true,
        icon: CalendarCheck,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
    },
    {
        label: 'Total Rooms',
        value: '48',
        change: '38 occupied',
        up: true,
        icon: BedDouble,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
    },
    {
        label: 'Avg. Rating',
        value: '4.6★',
        change: '+0.2 this month',
        up: true,
        icon: Star,
        color: 'text-amber-500',
        bg: 'bg-amber-50',
    },
]

const MOCK_HOTELS = [
    {
        id: '1', name: 'Eko Hotel & Suites', location: 'Victoria Island, Lagos',
        rooms: 48, occupancy: 79, rating: 4.6, revenue: 2840000, status: 'active',
    },
    {
        id: '2', name: 'Eko Signature', location: 'Victoria Island, Lagos',
        rooms: 32, occupancy: 65, rating: 4.4, revenue: 1980000, status: 'active',
    },
]

const MOCK_BOOKINGS: (Booking & { guestName: string })[] = [
    {
        id: 'BK001', userId: 'u1', roomId: 'r2', hotelId: '1',
        hotel: { id: '1', name: 'Eko Hotel & Suites', location: 'Lagos', images: [] } as any,
        room: { id: 'r2', name: 'Deluxe King Room', roomType: 'deluxe' } as any,
        checkIn: '2026-07-10', checkOut: '2026-07-13',
        guests: 2, nights: 3, totalPrice: 285000, currency: 'NGN',
        status: 'confirmed', createdAt: '2026-06-20T10:00:00Z',
        confirmationCode: 'SB-2026-4821', guestName: 'Amaka Okafor',
    },
    {
        id: 'BK002', userId: 'u2', roomId: 'r1', hotelId: '1',
        hotel: { id: '1', name: 'Eko Hotel & Suites', location: 'Lagos', images: [] } as any,
        room: { id: 'r1', name: 'Standard Queen Room', roomType: 'standard' } as any,
        checkIn: '2026-07-08', checkOut: '2026-07-09',
        guests: 1, nights: 1, totalPrice: 65000, currency: 'NGN',
        status: 'checked_in', createdAt: '2026-06-18T10:00:00Z',
        confirmationCode: 'SB-2026-4799', guestName: 'Tunde Bakare',
    },
    {
        id: 'BK003', userId: 'u3', roomId: 'r3', hotelId: '1',
        hotel: { id: '1', name: 'Eko Hotel & Suites', location: 'Lagos', images: [] } as any,
        room: { id: 'r3', name: 'Executive Suite', roomType: 'suite' } as any,
        checkIn: '2026-07-15', checkOut: '2026-07-18',
        guests: 3, nights: 3, totalPrice: 540000, currency: 'NGN',
        status: 'pending', createdAt: '2026-06-25T10:00:00Z',
        confirmationCode: 'SB-2026-4901', guestName: 'Fatima Kwara',
    },
    {
        id: 'BK004', userId: 'u4', roomId: 'r2', hotelId: '2',
        hotel: { id: '2', name: 'Eko Signature', location: 'Lagos', images: [] } as any,
        room: { id: 'r2', name: 'Deluxe King Room', roomType: 'deluxe' } as any,
        checkIn: '2026-06-28', checkOut: '2026-06-30',
        guests: 2, nights: 2, totalPrice: 190000, currency: 'NGN',
        status: 'confirmed', createdAt: '2026-06-15T10:00:00Z',
        confirmationCode: 'SB-2026-4755', guestName: 'Chidi Eze',
    },
    {
        id: 'BK005', userId: 'u5', roomId: 'r1', hotelId: '1',
        hotel: { id: '1', name: 'Eko Hotel & Suites', location: 'Lagos', images: [] } as any,
        room: { id: 'r1', name: 'Standard Queen Room', roomType: 'standard' } as any,
        checkIn: '2026-06-20', checkOut: '2026-06-22',
        guests: 1, nights: 2, totalPrice: 130000, currency: 'NGN',
        status: 'checked_out', createdAt: '2026-06-10T10:00:00Z',
        confirmationCode: 'SB-2026-4601', guestName: 'Ngozi Adeyemi',
    },
]

const REVENUE_BARS = [
    { month: 'Jan', value: 2100000 },
    { month: 'Feb', value: 1800000 },
    { month: 'Mar', value: 2600000 },
    { month: 'Apr', value: 3100000 },
    { month: 'May', value: 2900000 },
    { month: 'Jun', value: 4820000 },
]

const MAX_REVENUE = Math.max(...REVENUE_BARS.map((b) => b.value))

// ── Sidebar nav ───────────────────────────────────────────────────────────────

const NAV = [
    { label: 'Dashboard', href: '/dashboard/manager', icon: LayoutDashboard },
    { label: 'My Hotels', href: '/dashboard/manager/hotels', icon: Building2 },
    { label: 'Rooms', href: '/dashboard/manager/rooms', icon: BedDouble },
    { label: 'Reservations', href: '/dashboard/manager/reservations', icon: CalendarCheck },
    { label: 'Analytics', href: '/dashboard/manager/analytics', icon: BarChart3 },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function ManagerDashboardPage() {
    const [activeNav, setActiveNav] = useState('Dashboard')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [bookingFilter, setBookingFilter] = useState<BookingStatus | 'all'>('all')

    const filteredBookings = bookingFilter === 'all'
        ? MOCK_BOOKINGS
        : MOCK_BOOKINGS.filter((b) => b.status === bookingFilter)

    return (
        <div className="min-h-screen bg-surface-tertiary">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex gap-6">

                    {/* Sidebar */}
                    <aside className="hidden lg:block w-56 shrink-0">
                        <div className="card p-3 sticky top-24">
                            <div className="px-3 py-3 mb-2 border-b border-border">
                                <p className="text-xs text-ink-tertiary uppercase tracking-wider mb-1">Manager Portal</p>
                                <p className="font-semibold text-ink-primary text-sm">Eko Hotels Group</p>
                                <p className="text-xs text-ink-tertiary mt-0.5">2 properties</p>
                            </div>
                            <nav className="space-y-0.5 mt-2">
                                {NAV.map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => setActiveNav(item.label)}
                                        className={cn(
                                            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors text-left',
                                            activeNav === item.label
                                                ? 'bg-brand-50 text-brand font-medium'
                                                : 'text-ink-secondary hover:bg-surface-secondary hover:text-ink-primary'
                                        )}
                                    >
                                        <item.icon size={16} />
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                            <div className="border-t border-border mt-3 pt-3 px-3">
                                <button className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm">
                                    <Plus size={15} />
                                    Add hotel
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main content */}
                    <main className="flex-1 min-w-0 space-y-6">

                        {/* Page header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-ink-primary">Dashboard</h1>
                                <p className="text-sm text-ink-tertiary mt-0.5">Welcome back — here's what's happening today</p>
                            </div>
                            <Link href={'/dashboard/manager/hotels/new' as Route} className="btn-primary flex items-center gap-2 text-sm">
                                <Plus size={15} />
                                New hotel
                            </Link>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {STATS.map((s) => (
                                <div key={s.label} className="card p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs text-ink-tertiary">{s.label}</span>
                                        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', s.bg)}>
                                            <s.icon size={15} className={s.color} />
                                        </div>
                                    </div>
                                    <div className="text-2xl font-semibold text-ink-primary mb-1">{s.value}</div>
                                    <div className={cn(
                                        'flex items-center gap-1 text-xs font-medium',
                                        s.up ? 'text-brand' : 'text-red-500'
                                    )}>
                                        {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        {s.change}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Revenue chart + Occupancy */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* Revenue chart */}
                            <div className="card p-5 lg:col-span-2">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h2 className="font-semibold text-ink-primary">Monthly revenue</h2>
                                        <p className="text-xs text-ink-tertiary mt-0.5">Jan – Jun 2026</p>
                                    </div>
                                    <span className="badge bg-brand-50 text-brand text-xs px-2.5 py-1">
                                        +12.5% vs last year
                                    </span>
                                </div>
                                <div className="flex items-end gap-3 h-36">
                                    {REVENUE_BARS.map((b) => {
                                        const pct = (b.value / MAX_REVENUE) * 100
                                        const isCurrentMonth = b.month === 'Jun'
                                        return (
                                            <div key={b.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                                                <div className="relative w-full flex items-end" style={{ height: '112px' }}>
                                                    <div
                                                        className={cn(
                                                            'w-full rounded-t-lg transition-all duration-300',
                                                            isCurrentMonth ? 'bg-brand' : 'bg-surface-tertiary group-hover:bg-brand/30'
                                                        )}
                                                        style={{ height: `${pct}%` }}
                                                    />
                                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium text-ink-primary whitespace-nowrap">
                                                        ₦{(b.value / 1000000).toFixed(1)}M
                                                    </div>
                                                </div>
                                                <span className={cn(
                                                    'text-xs',
                                                    isCurrentMonth ? 'text-brand font-medium' : 'text-ink-tertiary'
                                                )}>
                                                    {b.month}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Occupancy */}
                            <div className="card p-5">
                                <h2 className="font-semibold text-ink-primary mb-4">Occupancy rate</h2>
                                <div className="space-y-4">
                                    {MOCK_HOTELS.map((h) => (
                                        <div key={h.id}>
                                            <div className="flex items-center justify-between text-sm mb-1.5">
                                                <span className="text-ink-secondary truncate">{h.name}</span>
                                                <span className="font-semibold text-ink-primary shrink-0 ml-2">{h.occupancy}%</span>
                                            </div>
                                            <div className="w-full bg-surface-tertiary rounded-full h-2">
                                                <div
                                                    className={cn(
                                                        'h-2 rounded-full transition-all duration-500',
                                                        h.occupancy >= 75 ? 'bg-brand' : h.occupancy >= 50 ? 'bg-amber-400' : 'bg-red-400'
                                                    )}
                                                    style={{ width: `${h.occupancy}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-ink-tertiary mt-1">
                                                {Math.round(h.rooms * h.occupancy / 100)} / {h.rooms} rooms occupied
                                            </p>
                                        </div>
                                    ))}

                                    <div className="border-t border-border pt-4 space-y-2">
                                        {[
                                            { label: 'Check-ins today', value: '6', icon: CheckCircle, color: 'text-brand' },
                                            { label: 'Check-outs today', value: '4', icon: XCircle, color: 'text-ink-tertiary' },
                                            { label: 'Pending review', value: '2', icon: Clock, color: 'text-amber-500' },
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <item.icon size={14} className={item.color} />
                                                    <span className="text-ink-secondary">{item.label}</span>
                                                </div>
                                                <span className="font-semibold text-ink-primary">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* My Hotels */}
                        <div className="card">
                            <div className="flex items-center justify-between p-5 border-b border-border">
                                <h2 className="font-semibold text-ink-primary">My hotels</h2>
                                <button className="text-sm text-brand hover:underline flex items-center gap-1">
                                    Manage all <ChevronRight size={14} />
                                </button>
                            </div>
                            <div className="divide-y divide-border">
                                {MOCK_HOTELS.map((h) => (
                                    <div key={h.id} className="p-5 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-surface-secondary flex items-center justify-center text-xl shrink-0">
                                            🏨
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-ink-primary text-sm">{h.name}</p>
                                            <p className="text-xs text-ink-tertiary mt-0.5">{h.location} · {h.rooms} rooms</p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-xs text-ink-secondary">⭐ {h.rating}</span>
                                                <span className="text-xs text-ink-secondary">🛏 {h.occupancy}% occupied</span>
                                                <span className={cn(
                                                    'text-xs font-medium px-1.5 py-0.5 rounded-md',
                                                    h.status === 'active' ? 'bg-brand-50 text-brand' : 'bg-red-50 text-red-600'
                                                )}>
                                                    {h.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-semibold text-ink-primary text-sm">
                                                ₦{(h.revenue / 1000000).toFixed(1)}M
                                            </p>
                                            <p className="text-xs text-ink-tertiary">this month</p>
                                            <div className="flex items-center gap-2 mt-2 justify-end">
                                                <button className="p-1.5 rounded-lg hover:bg-surface-secondary text-ink-tertiary hover:text-ink-primary transition-colors">
                                                    <Eye size={14} />
                                                </button>
                                                <button className="p-1.5 rounded-lg hover:bg-surface-secondary text-ink-tertiary hover:text-ink-primary transition-colors">
                                                    <Edit size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reservations table */}
                        <div className="card">
                            <div className="flex items-center justify-between p-5 border-b border-border flex-wrap gap-3">
                                <h2 className="font-semibold text-ink-primary">Recent reservations</h2>
                                {/* Filter tabs */}
                                <div className="flex items-center gap-1 bg-surface-secondary rounded-lg p-1">
                                    {(['all', 'pending', 'confirmed', 'checked_in', 'checked_out'] as const).map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setBookingFilter(f)}
                                            className={cn(
                                                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize',
                                                bookingFilter === f
                                                    ? 'bg-white shadow-card text-ink-primary'
                                                    : 'text-ink-tertiary hover:text-ink-secondary'
                                            )}
                                        >
                                            {f === 'all' ? 'All' : f.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-border">
                                            {['Guest', 'Hotel & Room', 'Dates', 'Guests', 'Total', 'Status', ''].map((h) => (
                                                <th key={h} className="text-left px-5 py-3 text-xs font-medium text-ink-tertiary uppercase tracking-wider">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredBookings.map((b) => {
                                            const cfg = BOOKING_STATUS_CONFIG[b.status]
                                            return (
                                                <tr key={b.id} className="hover:bg-surface-secondary/50 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <p className="font-medium text-ink-primary">{b.guestName}</p>
                                                        <p className="text-xs text-ink-tertiary">{b.confirmationCode}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="text-ink-primary">{b.hotel?.name}</p>
                                                        <p className="text-xs text-ink-tertiary">{b.room?.name}</p>
                                                    </td>
                                                    <td className="px-5 py-4 whitespace-nowrap">
                                                        <p className="text-ink-primary">{formatDate(b.checkIn, 'MMM d')}</p>
                                                        <p className="text-xs text-ink-tertiary">→ {formatDate(b.checkOut, 'MMM d, yyyy')}</p>
                                                    </td>
                                                    <td className="px-5 py-4 text-ink-secondary">{b.guests}</td>
                                                    <td className="px-5 py-4 font-medium text-ink-primary whitespace-nowrap">
                                                        {formatPrice(b.totalPrice, b.currency)}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span
                                                            className="badge text-xs px-2.5 py-1 font-medium"
                                                            style={{ background: cfg.bg, color: cfg.color }}
                                                        >
                                                            {cfg.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <button className="p-1.5 rounded-lg hover:bg-surface-secondary text-ink-tertiary hover:text-ink-primary transition-colors">
                                                                <Eye size={14} />
                                                            </button>
                                                            <button className="p-1.5 rounded-lg hover:bg-red-50 text-ink-tertiary hover:text-red-500 transition-colors">
                                                                <XCircle size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>

                                {filteredBookings.length === 0 && (
                                    <div className="text-center py-12 text-ink-tertiary text-sm">
                                        No reservations found for this filter
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}