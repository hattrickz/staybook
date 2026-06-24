'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
    MapPin, Star, Wifi, Car, Coffee, Waves, Dumbbell,
    Sparkles, UtensilsCrossed, Wine, ChevronLeft, ChevronRight,
    Check, Users, Clock, Phone
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { RoomCard } from '@/components/hotel/RoomCard'
import { cn, formatPrice, formatDate, ratingLabel, nightsBetween } from '@/lib/utils'
import type { Hotel, Room, Review } from '@/types'

// ── Mock data (replace with useQuery(GET_HOTEL) later) ──────────────────────

const MOCK_HOTEL: Hotel = {
    id: '2',
    name: 'Eko Hotel & Suites',
    description: `Eko Hotel & Suites is Lagos's premier luxury destination, sitting on a private peninsula overlooking the Atlantic Ocean. With world-class facilities, multiple restaurants, and a sprawling pool complex, it's the definitive five-star experience in West Africa. Whether you're here for business or leisure, Eko delivers unmatched service in the heart of Victoria Island.`,
    location: 'Plot 1415 Adetokunbo Ademola Street, Victoria Island, Lagos',
    city: 'Lagos',
    country: 'Nigeria',
    rating: 4.6,
    reviewCount: 892,
    images: [],
    amenities: [
        { key: 'pool', label: 'Swimming Pool', icon: 'Waves' },
        { key: 'wifi', label: 'Free WiFi', icon: 'Wifi' },
        { key: 'spa', label: 'Spa & Wellness', icon: 'Sparkles' },
        { key: 'restaurant', label: 'Restaurant', icon: 'UtensilsCrossed' },
        { key: 'bar', label: 'Bar & Lounge', icon: 'Wine' },
        { key: 'gym', label: 'Fitness Center', icon: 'Dumbbell' },
        { key: 'parking', label: 'Free Parking', icon: 'Car' },
        { key: 'breakfast', label: 'Breakfast', icon: 'Coffee' },
    ],
    managerId: '2',
    priceFrom: 95000,
    currency: 'NGN',
    checkInTime: '2:00 PM',
    checkOutTime: '12:00 PM',
    policies: [
        'No smoking inside rooms',
        'Pets not allowed',
        'Valid ID required at check-in',
        'Credit card required for incidentals',
    ],
}

const MOCK_ROOMS: Room[] = [
    {
        id: 'r1', hotelId: '2', name: 'Standard Queen Room',
        roomType: 'standard', bedType: 'queen',
        price: 65000, currency: 'NGN',
        capacity: 2, size: 32, available: true,
        images: [],
        amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV', 'Mini fridge'],
        description: 'A comfortable room with a queen bed and modern amenities, perfect for short stays.',
        refundable: true, breakfastIncluded: false,
    },
    {
        id: 'r2', hotelId: '2', name: 'Deluxe King Room',
        roomType: 'deluxe', bedType: 'king',
        price: 95000, currency: 'NGN',
        capacity: 2, size: 45, available: true,
        images: [],
        amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV', 'Mini bar', 'Ocean view'],
        description: 'Spacious deluxe room with a king bed, ocean view, and premium finishes throughout.',
        refundable: true, breakfastIncluded: true,
    },
    {
        id: 'r3', hotelId: '2', name: 'Executive Suite',
        roomType: 'suite', bedType: 'king',
        price: 180000, currency: 'NGN',
        capacity: 3, size: 75, available: true,
        images: [],
        amenities: ['Free WiFi', 'Living area', 'Jacuzzi', 'Butler service', 'Ocean view', 'Mini bar'],
        description: 'A stunning suite with separate living area, Jacuzzi, and panoramic ocean views.',
        refundable: false, breakfastIncluded: true,
    },
    {
        id: 'r4', hotelId: '2', name: 'Presidential Suite',
        roomType: 'presidential', bedType: 'king',
        price: 450000, currency: 'NGN',
        capacity: 4, size: 140, available: false,
        images: [],
        amenities: ['Free WiFi', '2 Bedrooms', 'Private pool', 'Butler service', 'Dining room', 'Kitchen'],
        description: 'The ultimate luxury experience — a two-bedroom suite with private pool and dedicated butler.',
        refundable: false, breakfastIncluded: true,
    },
]

const MOCK_REVIEWS: Review[] = [
    {
        id: 'rv1', userId: 'u1', hotelId: '2',
        user: { id: 'u1', name: 'Amaka O.', avatar: undefined },
        rating: 5, title: 'Absolutely world class',
        body: "The service was impeccable from check-in to check-out. The pool area is stunning and the food at the restaurant was some of the best I've had in Lagos. Will definitely return.",
        createdAt: '2026-05-12T10:00:00Z',
        categories: { cleanliness: 5, service: 5, location: 4, value: 4 },
    },
    {
        id: 'rv2', userId: 'u2', hotelId: '2',
        user: { id: 'u2', name: 'Tunde B.', avatar: undefined },
        rating: 4, title: 'Great stay, minor issues',
        body: 'Room was spacious and clean. The view from the Deluxe King was incredible. Only minor complaint is the WiFi speed could be faster. Overall a fantastic experience.',
        createdAt: '2026-04-28T10:00:00Z',
        categories: { cleanliness: 5, service: 4, location: 5, value: 4 },
    },
    {
        id: 'rv3', userId: 'u3', hotelId: '2',
        user: { id: 'u3', name: 'Fatima K.', avatar: undefined },
        rating: 5, title: 'Best hotel in Lagos, period.',
        body: 'Stayed for 4 nights for a conference. The business facilities are top notch, the spa is incredible, and the staff remembered my name every single day. Highly recommend.',
        createdAt: '2026-03-15T10:00:00Z',
        categories: { cleanliness: 5, service: 5, location: 5, value: 5 },
    },
]

const AMENITY_ICONS: Record<string, React.ReactNode> = {
    Waves: <Waves size={18} />,
    Wifi: <Wifi size={18} />,
    Sparkles: <Sparkles size={18} />,
    UtensilsCrossed: <UtensilsCrossed size={18} />,
    Wine: <Wine size={18} />,
    Dumbbell: <Dumbbell size={18} />,
    Car: <Car size={18} />,
    Coffee: <Coffee size={18} />,
}

const GALLERY_PLACEHOLDERS = ['🌅', '🏊', '🍽️', '🛁', '🌃', '🏖️']

// ── Component ────────────────────────────────────────────────────────────────

export default function HotelDetailsPage() {
    const params = useParams()
    const [activeImg, setActiveImg] = useState(0)
    const [checkIn, setCheckIn] = useState(() => new Date().toISOString().split('T')[0])
    const [checkOut, setCheckOut] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() + 2)
        return d.toISOString().split('T')[0]
    })
    const [guests, setGuests] = useState(2)
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

    const hotel = MOCK_HOTEL
    const rooms = MOCK_ROOMS
    const reviews = MOCK_REVIEWS
    const nights = nightsBetween(checkIn, checkOut) || 1

    const handleReserve = (room: Room) => {
        setSelectedRoom(room)
        document.getElementById('booking-panel')?.scrollIntoView({ behavior: 'smooth' })
    }

    const avgCategories = {
        Cleanliness: (reviews.reduce((s, r) => s + (r.categories?.cleanliness ?? 0), 0) / reviews.length).toFixed(1),
        Service: (reviews.reduce((s, r) => s + (r.categories?.service ?? 0), 0) / reviews.length).toFixed(1),
        Location: (reviews.reduce((s, r) => s + (r.categories?.location ?? 0), 0) / reviews.length).toFixed(1),
        Value: (reviews.reduce((s, r) => s + (r.categories?.value ?? 0), 0) / reviews.length).toFixed(1),
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center gap-2 text-sm text-ink-tertiary">
                    <Link href="/" className="hover:text-brand">Home</Link>
                    <span>/</span>
                    <Link href="/hotels" className="hover:text-brand">Hotels</Link>
                    <span>/</span>
                    <span className="text-ink-primary">{hotel.name}</span>
                </div>
            </div>

            {/* Gallery */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="flex gap-3 h-96 rounded-2xl overflow-hidden">
                    {/* Main image */}
                    <div className="relative flex-1 bg-surface-tertiary flex items-center justify-center group cursor-pointer">
                        <span className="text-8xl">{GALLERY_PLACEHOLDERS[activeImg]}</span>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        {/* Prev / Next */}
                        <button
                            onClick={() => setActiveImg((i) => Math.max(0, i - 1))}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setActiveImg((i) => Math.min(GALLERY_PLACEHOLDERS.length - 1, i + 1))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <ChevronRight size={18} />
                        </button>
                        <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                            {activeImg + 1} / {GALLERY_PLACEHOLDERS.length}
                        </span>
                    </div>
                    {/* Thumbnails */}
                    <div className="hidden md:flex flex-col gap-3 w-48">
                        {GALLERY_PLACEHOLDERS.slice(0, 3).map((emoji, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveImg(i)}
                                className={cn(
                                    'flex-1 bg-surface-tertiary rounded-xl flex items-center justify-center text-3xl transition-all',
                                    activeImg === i ? 'ring-2 ring-brand' : 'opacity-70 hover:opacity-100'
                                )}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Left column */}
                    <div className="flex-1 min-w-0 space-y-10">

                        {/* Hotel header */}
                        <div>
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <h1 className="text-3xl font-semibold text-ink-primary mb-2">{hotel.name}</h1>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <div className="flex items-center gap-1.5 text-sm">
                                            <Star size={15} className="text-amber-400 fill-amber-400" />
                                            <span className="font-semibold text-ink-primary">{hotel.rating}</span>
                                            <span className="text-ink-tertiary">({hotel.reviewCount.toLocaleString()} reviews)</span>
                                            <span className="text-brand font-medium">· {ratingLabel(hotel.rating)}</span>
                                        </div>
                                        <span className="text-ink-tertiary">·</span>
                                        <div className="flex items-center gap-1 text-sm text-ink-secondary">
                                            <MapPin size={14} />
                                            {hotel.location}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-semibold text-ink-primary">
                                        {formatPrice(hotel.priceFrom, hotel.currency)}
                                    </div>
                                    <div className="text-sm text-ink-tertiary">starting from / night</div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h2 className="text-lg font-semibold text-ink-primary mb-3">About this hotel</h2>
                            <p className="text-ink-secondary leading-relaxed text-sm">{hotel.description}</p>
                        </div>

                        {/* Amenities */}
                        <div>
                            <h2 className="text-lg font-semibold text-ink-primary mb-4">Amenities</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {hotel.amenities.map((a) => (
                                    <div key={a.key} className="flex items-center gap-3 bg-surface-secondary rounded-xl p-3">
                                        <span className="text-brand">{AMENITY_ICONS[a.icon] ?? <Check size={18} />}</span>
                                        <span className="text-sm text-ink-secondary">{a.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Check-in info */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { icon: Clock, label: 'Check-in', value: hotel.checkInTime ?? '2:00 PM' },
                                { icon: Clock, label: 'Check-out', value: hotel.checkOutTime ?? '12:00 PM' },
                                { icon: Users, label: 'Capacity', value: 'Up to 4 guests' },
                                { icon: Phone, label: 'Support', value: '24 / 7' },
                            ].map((item) => (
                                <div key={item.label} className="card p-4 text-center">
                                    <item.icon size={18} className="text-brand mx-auto mb-1.5" />
                                    <p className="text-xs text-ink-tertiary">{item.label}</p>
                                    <p className="text-sm font-medium text-ink-primary mt-0.5">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Available rooms */}
                        <div>
                            <h2 className="text-lg font-semibold text-ink-primary mb-4">Available rooms</h2>
                            <div className="space-y-4">
                                {rooms.map((room) => (
                                    <RoomCard
                                        key={room.id}
                                        room={room}
                                        checkIn={checkIn}
                                        checkOut={checkOut}
                                        nights={nights}
                                        onReserve={handleReserve}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Policies */}
                        <div>
                            <h2 className="text-lg font-semibold text-ink-primary mb-4">Hotel policies</h2>
                            <div className="card p-5 space-y-2">
                                {hotel.policies?.map((p) => (
                                    <div key={p} className="flex items-center gap-2.5 text-sm text-ink-secondary">
                                        <Check size={14} className="text-brand shrink-0" />
                                        {p}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reviews */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-ink-primary">
                                    Guest reviews
                                    <span className="ml-2 text-sm font-normal text-ink-tertiary">
                                        ({hotel.reviewCount.toLocaleString()})
                                    </span>
                                </h2>
                                <div className="flex items-center gap-2 bg-brand-50 text-brand px-3 py-1.5 rounded-xl">
                                    <Star size={14} fill="currentColor" />
                                    <span className="font-semibold">{hotel.rating}</span>
                                    <span className="text-sm text-brand/70">{ratingLabel(hotel.rating)}</span>
                                </div>
                            </div>

                            {/* Category scores */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                {Object.entries(avgCategories).map(([key, val]) => (
                                    <div key={key} className="card p-3 text-center">
                                        <div className="text-xl font-semibold text-ink-primary">{val}</div>
                                        <div className="text-xs text-ink-tertiary mt-0.5">{key}</div>
                                        <div className="w-full bg-surface-tertiary rounded-full h-1 mt-2">
                                            <div
                                                className="bg-brand h-1 rounded-full"
                                                style={{ width: `${(Number(val) / 5) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Review cards */}
                            <div className="space-y-4">
                                {reviews.map((r) => (
                                    <div key={r.id} className="card p-5">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-brand font-semibold text-sm">
                                                    {r.user?.name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-ink-primary text-sm">{r.user?.name}</p>
                                                    <p className="text-xs text-ink-tertiary">{formatDate(r.createdAt)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-amber-400 text-sm font-medium shrink-0">
                                                <Star size={13} fill="currentColor" />
                                                {r.rating}.0
                                            </div>
                                        </div>
                                        <p className="font-medium text-ink-primary text-sm mb-1">{r.title}</p>
                                        <p className="text-sm text-ink-secondary leading-relaxed">{r.body}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sticky booking sidebar */}
                    <aside className="lg:w-80 shrink-0" id="booking-panel">
                        <div className="card p-5 sticky top-24">
                            <h3 className="font-semibold text-ink-primary mb-4">
                                {selectedRoom ? `Reserve: ${selectedRoom.name}` : 'Plan your stay'}
                            </h3>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div>
                                    <label className="label">Check in</label>
                                    <input
                                        type="date"
                                        value={checkIn}
                                        onChange={(e) => setCheckIn(e.target.value)}
                                        className="input text-sm py-2"
                                    />
                                </div>
                                <div>
                                    <label className="label">Check out</label>
                                    <input
                                        type="date"
                                        value={checkOut}
                                        onChange={(e) => setCheckOut(e.target.value)}
                                        className="input text-sm py-2"
                                    />
                                </div>
                            </div>

                            {/* Guests */}
                            <div className="mb-4">
                                <label className="label">Guests</label>
                                <select
                                    value={guests}
                                    onChange={(e) => setGuests(Number(e.target.value))}
                                    className="input text-sm py-2"
                                >
                                    {[1, 2, 3, 4, 5, 6].map((n) => (
                                        <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Selected room summary */}
                            {selectedRoom && (
                                <div className="bg-brand-50 rounded-xl p-3 mb-4 space-y-1.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-ink-secondary">{selectedRoom.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-ink-secondary">{formatPrice(selectedRoom.price, selectedRoom.currency)} × {nights} nights</span>
                                        <span className="font-medium text-ink-primary">
                                            {formatPrice(selectedRoom.price * nights, selectedRoom.currency)}
                                        </span>
                                    </div>
                                    <div className="border-t border-brand/20 pt-1.5 flex justify-between font-semibold">
                                        <span>Total</span>
                                        <span className="text-brand">{formatPrice(selectedRoom.price * nights, selectedRoom.currency)}</span>
                                    </div>
                                </div>
                            )}

                            <Link
                                href={selectedRoom
                                    ? `/booking/${selectedRoom.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
                                    : '#rooms'
                                }
                                className={cn(
                                    'w-full block text-center font-medium py-3 rounded-xl transition-colors text-sm',
                                    selectedRoom
                                        ? 'bg-brand hover:bg-brand-600 text-white'
                                        : 'bg-surface-secondary text-ink-secondary hover:bg-surface-tertiary'
                                )}
                            >
                                {selectedRoom ? 'Confirm reservation →' : 'Select a room below'}
                            </Link>

                            <p className="text-xs text-ink-tertiary text-center mt-3">
                                No charge yet · Free cancellation on most rooms
                            </p>

                            {/* Contact */}
                            <div className="border-t border-border mt-4 pt-4">
                                <p className="text-xs text-ink-tertiary text-center mb-2">
                                    Need help booking?
                                </p>

                                <a
                                    href="tel:+2341234567"
                                    className="flex items-center justify-center gap-2 text-sm text-brand hover:underline"
                                >
                                    <Phone size={14} />
                                    +234 123 456 7890
                                </a>
                            </div>
                        </div>
                    </aside>
                </div>
            </div >

            <Footer />
        </div >
    )
}