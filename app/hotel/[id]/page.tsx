
'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@apollo/client'
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
import { GET_HOTEL } from '@/graphql/queries'
import type { Room } from '@/types'

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

const GALLERY = ['🌅', '🏊', '🍽️', '🛁', '🌃', '🏖️']

function SkeletonBlock({ className }: { className?: string }) {
    return <div className={cn('bg-surface-tertiary rounded-lg animate-pulse', className)} />
}

function getAvgCats(reviews: any[]) {
    if (!reviews || reviews.length === 0) return null
    const n = reviews.length
    return {
        Cleanliness: (reviews.reduce((s, r) => s + (r.categories?.cleanliness ?? 0), 0) / n).toFixed(1),
        Service: (reviews.reduce((s, r) => s + (r.categories?.service ?? 0), 0) / n).toFixed(1),
        Location: (reviews.reduce((s, r) => s + (r.categories?.location ?? 0), 0) / n).toFixed(1),
        Value: (reviews.reduce((s, r) => s + (r.categories?.value ?? 0), 0) / n).toFixed(1),
    }
}

export default function HotelDetailsPage() {
    const params = useParams()
    const hotelId = params.id as string

    const [activeImg, setActiveImg] = useState(0)
    const [checkIn, setCheckIn] = useState(() => new Date().toISOString().split('T')[0])
    const [checkOut, setCheckOut] = useState(() => {
        const d = new Date()
        d.setDate(d.getDate() + 2)
        return d.toISOString().split('T')[0]
    })
    const [guests, setGuests] = useState(2)
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

    const { data, loading, error } = useQuery(GET_HOTEL, {
        variables: { id: hotelId },
        skip: !hotelId,
    })

    const hotel = data?.hotel
    const rooms = hotel?.rooms ?? []
    const reviews = hotel?.reviews ?? []
    const nights = nightsBetween(checkIn, checkOut) || 1
    const avgCats = getAvgCats(reviews)

    const handleReserve = (room: Room) => {
        setSelectedRoom(room)
        document.getElementById('booking-panel')?.scrollIntoView({ behavior: 'smooth' })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
                    <SkeletonBlock className="w-full h-80 rounded-2xl" />
                    <SkeletonBlock className="h-8 w-1/2" />
                    <SkeletonBlock className="h-4 w-1/3" />
                    <SkeletonBlock className="h-24 w-full" />
                </div>
            </div>
        )
    }

    if (error || !hotel) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="max-w-xl mx-auto px-4 py-24 text-center">
                    <p className="text-5xl mb-4">🏨</p>
                    <h1 className="text-xl font-semibold text-ink-primary mb-2">Hotel not found</h1>
                    <p className="text-ink-secondary text-sm mb-6">
                        This hotel may have been removed or the link is incorrect.
                    </p>
                    <Link href="/hotels" className="btn-primary">Browse all hotels</Link>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center gap-2 text-sm text-ink-tertiary">
                    <Link href="/" className="hover:text-brand">Home</Link>
                    <span>/</span>
                    <Link href="/hotels" className="hover:text-brand">Hotels</Link>
                    <span>/</span>
                    <span className="text-ink-primary truncate">{hotel.name}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
                <div className="flex gap-3 h-72 md:h-96 rounded-2xl overflow-hidden">
                    <div className="relative flex-1 bg-surface-tertiary flex items-center justify-center group cursor-pointer">
                        {hotel.images?.[activeImg] ? (
                            <img src={hotel.images[activeImg]} alt={hotel.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-8xl">{GALLERY[activeImg % GALLERY.length]}</span>
                        )}
                        <button
                            onClick={() => setActiveImg((i) => Math.max(0, i - 1))}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setActiveImg((i) => Math.min(GALLERY.length - 1, i + 1))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 flex items-center justify-center shadow hover:bg-white opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                        <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                            {activeImg + 1} / {GALLERY.length}
                        </span>
                    </div>
                    <div className="hidden md:flex flex-col gap-3 w-48">
                        {GALLERY.slice(0, 3).map((emoji, i) => (
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-1 min-w-0 space-y-10">

                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-semibold text-ink-primary mb-2">{hotel.name}</h1>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="flex items-center gap-1.5 text-sm">
                                        <Star size={15} className="text-amber-400 fill-amber-400" />
                                        <span className="font-semibold text-ink-primary">{hotel.rating}</span>
                                        <span className="text-ink-tertiary">({hotel.reviewCount?.toLocaleString()} reviews)</span>
                                        <span className="text-brand font-medium">· {ratingLabel(hotel.rating)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-ink-secondary">
                                        <MapPin size={14} />
                                        {hotel.location}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-semibold text-ink-primary">{formatPrice(hotel.priceFrom, hotel.currency)}</div>
                                <div className="text-sm text-ink-tertiary">starting from / night</div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-ink-primary mb-3">About this hotel</h2>
                            <p className="text-ink-secondary leading-relaxed text-sm">{hotel.description}</p>
                        </div>

                        {hotel.amenities?.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-ink-primary mb-4">Amenities</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {hotel.amenities.map((a: any) => (
                                        <div key={a.key} className="flex items-center gap-3 bg-surface-secondary rounded-xl p-3">
                                            <span className="text-brand">{AMENITY_ICONS[a.icon] ?? <Check size={18} />}</span>
                                            <span className="text-sm text-ink-secondary">{a.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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

                        <div id="rooms">
                            <h2 className="text-lg font-semibold text-ink-primary mb-4">
                                Available rooms
                                <span className="ml-2 text-sm font-normal text-ink-tertiary">
                                    ({rooms.filter((r: any) => r.available).length} available)
                                </span>
                            </h2>
                            {rooms.length === 0 ? (
                                <div className="card p-8 text-center text-ink-tertiary text-sm">No rooms listed yet.</div>
                            ) : (
                                <div className="space-y-4">
                                    {rooms.map((room: any) => (
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
                            )}
                        </div>

                        {hotel.policies?.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold text-ink-primary mb-4">Hotel policies</h2>
                                <div className="card p-5 space-y-2">
                                    {hotel.policies.map((p: string) => (
                                        <div key={p} className="flex items-center gap-2.5 text-sm text-ink-secondary">
                                            <Check size={14} className="text-brand shrink-0" />
                                            {p}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-ink-primary">
                                    Guest reviews
                                    <span className="ml-2 text-sm font-normal text-ink-tertiary">({hotel.reviewCount?.toLocaleString()})</span>
                                </h2>
                                <div className="flex items-center gap-2 bg-brand-50 text-brand px-3 py-1.5 rounded-xl">
                                    <Star size={14} fill="currentColor" />
                                    <span className="font-semibold">{hotel.rating}</span>
                                    <span className="text-sm text-brand/70">{ratingLabel(hotel.rating)}</span>
                                </div>
                            </div>

                            {avgCats && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                                    {Object.entries(avgCats).map(([key, val]) => (
                                        <div key={key} className="card p-3 text-center">
                                            <div className="text-xl font-semibold text-ink-primary">{val}</div>
                                            <div className="text-xs text-ink-tertiary mt-0.5">{key}</div>
                                            <div className="w-full bg-surface-tertiary rounded-full h-1 mt-2">
                                                <div className="bg-brand h-1 rounded-full" style={{ width: `${(Number(val) / 5) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {reviews.length === 0 ? (
                                <div className="card p-8 text-center text-ink-tertiary text-sm">No reviews yet.</div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((r: any) => (
                                        <div key={r.id} className="card p-5">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-brand font-semibold text-sm shrink-0">
                                                        {r.user?.name?.[0] ?? 'G'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-ink-primary text-sm">{r.user?.name ?? 'Guest'}</p>
                                                        <p className="text-xs text-ink-tertiary">{formatDate(r.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-amber-400 text-sm font-medium shrink-0">
                                                    <Star size={13} fill="currentColor" />
                                                    {r.rating?.toFixed(1)}
                                                </div>
                                            </div>
                                            <p className="font-medium text-ink-primary text-sm mb-1">{r.title}</p>
                                            <p className="text-sm text-ink-secondary leading-relaxed">{r.body}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <aside className="lg:w-80 shrink-0" id="booking-panel">
                        <div className="card p-5 sticky top-24">
                            <h3 className="font-semibold text-ink-primary mb-4">
                                {selectedRoom ? `Reserve: ${selectedRoom.name}` : 'Plan your stay'}
                            </h3>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div>
                                    <label className="label">Check in</label>
                                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="input text-sm py-2" />
                                </div>
                                <div>
                                    <label className="label">Check out</label>
                                    <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="input text-sm py-2" />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="label">Guests</label>
                                <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="input text-sm py-2">
                                    {[1, 2, 3, 4, 5, 6].map((n) => (
                                        <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                                    ))}
                                </select>
                            </div>
                            {selectedRoom && (
                                <div className="bg-brand-50 rounded-xl p-3 mb-4 space-y-1.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-ink-secondary">{selectedRoom.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-ink-secondary">{formatPrice(selectedRoom.price, selectedRoom.currency)} × {nights} nights</span>
                                        <span className="font-medium text-ink-primary">{formatPrice(selectedRoom.price * nights, selectedRoom.currency)}</span>
                                    </div>
                                    <div className="border-t border-brand/20 pt-1.5 flex justify-between font-semibold">
                                        <span>Total</span>
                                        <span className="text-brand">{formatPrice(selectedRoom.price * nights, selectedRoom.currency)}</span>
                                    </div>
                                </div>
                            )}
                            <Link
                                href={selectedRoom
                                    ? `/booking/${selectedRoom.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&price=${selectedRoom.price}&currency=${selectedRoom.currency}&roomName=${encodeURIComponent(selectedRoom.name)}&hotelName=${encodeURIComponent(hotel.name)}`
                                    : '#rooms'
                                }
                                className={cn(
                                    'w-full block text-center font-medium py-3 rounded-xl transition-colors text-sm',
                                    selectedRoom ? 'bg-brand hover:bg-brand-600 text-white' : 'bg-surface-secondary text-ink-secondary hover:bg-surface-tertiary'
                                )}
                            >
                                {selectedRoom ? 'Confirm reservation →' : 'Select a room below ↓'}
                            </Link>
                            <p className="text-xs text-ink-tertiary text-center mt-3">No charge yet · Free cancellation on most rooms</p>
                            <div className="border-t border-border mt-4 pt-4">
                                <p className="text-xs text-ink-tertiary text-center mb-2">Need help booking?</p>
                                <a href="tel:+2341234567" className="flex items-center justify-center gap-2 text-sm text-brand hover:underline">
                                    <Phone size={14} />
                                    +234 123 456 7890
                                </a>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <Footer />
        </div>
    )
}
