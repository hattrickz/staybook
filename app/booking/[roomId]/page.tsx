'use client'

import { useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ChevronLeft, Check, CreditCard, User, Mail,
    Phone, MessageSquare, Shield, Clock, Star
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navbar } from '@/components/layout/Navbar'
import { cn, formatPrice, formatDate, nightsBetween } from '@/lib/utils'
import type { Room, Hotel } from '@/types'

// ── Mock data (replace with useQuery later) ──────────────────────────────────

const MOCK_ROOM: Room = {
    id: 'r2', hotelId: '2', name: 'Deluxe King Room',
    roomType: 'deluxe', bedType: 'king',
    price: 95000, currency: 'NGN',
    capacity: 2, size: 45, available: true,
    images: [],
    amenities: ['Free WiFi', 'Air conditioning', 'Flat-screen TV', 'Mini bar', 'Ocean view'],
    description: 'Spacious deluxe room with a king bed, ocean view, and premium finishes.',
    refundable: true, breakfastIncluded: true,
}

const MOCK_HOTEL: Pick<Hotel, 'id' | 'name' | 'location' | 'rating' | 'reviewCount'> = {
    id: '2',
    name: 'Eko Hotel & Suites',
    location: 'Victoria Island, Lagos',
    rating: 4.6,
    reviewCount: 892,
}

// ── Form schema ───────────────────────────────────────────────────────────────

const schema = z.object({
    firstName: z.string().min(2, 'Required'),
    lastName: z.string().min(2, 'Required'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().min(8, 'Enter a valid phone number'),
    specialRequests: z.string().optional(),
    cardNumber: z.string().min(16, 'Enter a valid card number').max(19),
    cardName: z.string().min(2, 'Required'),
    cardExpiry: z.string().min(5, 'MM/YY format'),
    cardCvc: z.string().min(3, 'Required').max(4),
})

type FormValues = z.infer<typeof schema>

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = ['Guest details', 'Payment', 'Confirm']

// ── Component ─────────────────────────────────────────────────────────────────

export default function BookingPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()

    const checkIn = searchParams.get('checkIn') || new Date().toISOString().split('T')[0]
    const checkOut = searchParams.get('checkOut') || (() => { const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split('T')[0] })()
    const guests = Number(searchParams.get('guests') || 2)
    const nights = nightsBetween(checkIn, checkOut) || 1

    const room = MOCK_ROOM
    const hotel = MOCK_HOTEL

    const [step, setStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [confirmed, setConfirmed] = useState(false)
    const [confirmationCode] = useState('SB-2026-' + Math.floor(1000 + Math.random() * 9000))

    const subtotal = room.price * nights
    const taxRate = 0.075
    const taxes = Math.round(subtotal * taxRate)
    const total = subtotal + taxes

    const { register, handleSubmit, trigger, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
    })

    const guestFields = ['firstName', 'lastName', 'email', 'phone'] as const
    const paymentFields = ['cardNumber', 'cardName', 'cardExpiry', 'cardCvc'] as const

    const handleNext = async () => {
        const fields = step === 0 ? guestFields : paymentFields
        const valid = await trigger(fields)
        if (valid) setStep((s) => s + 1)
    }

    const onSubmit = async (_values: FormValues) => {
        setIsSubmitting(true)
        // TODO: call createBooking mutation
        await new Promise((res) => setTimeout(res, 1800))
        setIsSubmitting(false)
        setConfirmed(true)
    }

    // ── Confirmation screen ───────────────────────────────────────────────────

    if (confirmed) {
        return (
            <div className="min-h-screen bg-surface-tertiary">
                <Navbar />
                <div className="max-w-lg mx-auto px-4 py-16 text-center">
                    <div className="card p-10">
                        <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-5">
                            <Check size={28} className="text-brand" />
                        </div>
                        <h1 className="text-2xl font-semibold text-ink-primary mb-2">Booking confirmed!</h1>
                        <p className="text-ink-secondary text-sm mb-6">
                            Your reservation at <span className="font-medium text-ink-primary">{hotel.name}</span> is confirmed.
                            A confirmation email has been sent.
                        </p>

                        <div className="bg-surface-secondary rounded-xl p-5 text-left space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-ink-tertiary">Confirmation code</span>
                                <span className="font-semibold text-brand">{confirmationCode}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-ink-tertiary">Hotel</span>
                                <span className="font-medium text-ink-primary">{hotel.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-ink-tertiary">Room</span>
                                <span className="font-medium text-ink-primary">{room.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-ink-tertiary">Check-in</span>
                                <span className="font-medium text-ink-primary">{formatDate(checkIn)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-ink-tertiary">Check-out</span>
                                <span className="font-medium text-ink-primary">{formatDate(checkOut)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-ink-tertiary">Guests</span>
                                <span className="font-medium text-ink-primary">{guests}</span>
                            </div>
                            <div className="border-t border-border pt-3 flex justify-between">
                                <span className="text-ink-tertiary text-sm">Total paid</span>
                                <span className="font-semibold text-ink-primary">{formatPrice(total, room.currency)}</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link href="/dashboard" className="btn-primary text-center py-3">
                                View my bookings
                            </Link>
                            <Link href="/hotels" className="btn-outline text-center py-3">
                                Browse more hotels
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ── Booking form ──────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-surface-tertiary">
            <Navbar />

            {/* Header */}
            <div className="bg-white border-b border-border">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                    <Link
                        href={`/hotel/${hotel.id}`}
                        className="flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink-primary transition-colors"
                    >
                        <ChevronLeft size={16} /> Back
                    </Link>
                    <div className="flex-1">
                        {/* Step progress */}
                        <div className="flex items-center gap-2 justify-center">
                            {STEPS.map((label, i) => (
                                <div key={label} className="flex items-center gap-2">
                                    <div className={cn(
                                        'flex items-center gap-1.5 text-xs font-medium',
                                        i < step ? 'text-brand' : i === step ? 'text-ink-primary' : 'text-ink-tertiary'
                                    )}>
                                        <div className={cn(
                                            'w-5 h-5 rounded-full flex items-center justify-center text-xs',
                                            i < step ? 'bg-brand text-white' :
                                                i === step ? 'bg-ink-primary text-white' :
                                                    'bg-surface-tertiary text-ink-tertiary'
                                        )}>
                                            {i < step ? <Check size={10} /> : i + 1}
                                        </div>
                                        <span className="hidden sm:inline">{label}</span>
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div className={cn('w-8 h-px', i < step ? 'bg-brand' : 'bg-border')} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Left — form */}
                        <div className="flex-1 min-w-0 space-y-6">

                            {/* ── Step 0: Guest details ── */}
                            {step === 0 && (
                                <div className="card p-6">
                                    <div className="flex items-center gap-2 mb-5">
                                        <User size={18} className="text-brand" />
                                        <h2 className="font-semibold text-ink-primary">Guest details</h2>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">First name</label>
                                            <input {...register('firstName')} className="input" placeholder="John" />
                                            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                                        </div>
                                        <div>
                                            <label className="label">Last name</label>
                                            <input {...register('lastName')} className="input" placeholder="Smith" />
                                            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                                        </div>
                                        <div>
                                            <label className="label">Email address</label>
                                            <div className="relative">
                                                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                                                <input {...register('email')} type="email" className="input pl-9" placeholder="you@example.com" />
                                            </div>
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                        </div>
                                        <div>
                                            <label className="label">Phone number</label>
                                            <div className="relative">
                                                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                                                <input {...register('phone')} type="tel" className="input pl-9" placeholder="+234 800 000 0000" />
                                            </div>
                                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="label">Special requests <span className="text-ink-tertiary font-normal normal-case">(optional)</span></label>
                                            <div className="relative">
                                                <MessageSquare size={15} className="absolute left-3 top-3 text-ink-tertiary" />
                                                <textarea
                                                    {...register('specialRequests')}
                                                    rows={3}
                                                    className="input pl-9 resize-none"
                                                    placeholder="Late check-in, extra pillows, dietary requirements…"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 1: Payment ── */}
                            {step === 1 && (
                                <div className="card p-6">
                                    <div className="flex items-center gap-2 mb-5">
                                        <CreditCard size={18} className="text-brand" />
                                        <h2 className="font-semibold text-ink-primary">Payment details</h2>
                                    </div>

                                    <div className="flex items-center gap-2 bg-brand-50 text-brand text-xs px-3 py-2 rounded-lg mb-5">
                                        <Shield size={13} />
                                        Your payment info is encrypted and secure. You won't be charged until you confirm.
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="label">Card number</label>
                                            <div className="relative">
                                                <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                                                <input
                                                    {...register('cardNumber')}
                                                    className="input pl-9"
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength={19}
                                                />
                                            </div>
                                            {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber.message}</p>}
                                        </div>
                                        <div>
                                            <label className="label">Name on card</label>
                                            <input {...register('cardName')} className="input" placeholder="John Smith" />
                                            {errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName.message}</p>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="label">Expiry date</label>
                                                <input {...register('cardExpiry')} className="input" placeholder="MM/YY" maxLength={5} />
                                                {errors.cardExpiry && <p className="text-red-500 text-xs mt-1">{errors.cardExpiry.message}</p>}
                                            </div>
                                            <div>
                                                <label className="label">CVC</label>
                                                <input {...register('cardCvc')} className="input" placeholder="123" maxLength={4} type="password" />
                                                {errors.cardCvc && <p className="text-red-500 text-xs mt-1">{errors.cardCvc.message}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 2: Review & confirm ── */}
                            {step === 2 && (
                                <div className="card p-6 space-y-5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Check size={18} className="text-brand" />
                                        <h2 className="font-semibold text-ink-primary">Review your booking</h2>
                                    </div>

                                    <div className="bg-surface-secondary rounded-xl p-4 space-y-3">
                                        {[
                                            { label: 'Hotel', value: hotel.name },
                                            { label: 'Room', value: room.name },
                                            { label: 'Check-in', value: formatDate(checkIn) },
                                            { label: 'Check-out', value: formatDate(checkOut) },
                                            { label: 'Nights', value: String(nights) },
                                            { label: 'Guests', value: String(guests) },
                                        ].map((row) => (
                                            <div key={row.label} className="flex justify-between text-sm">
                                                <span className="text-ink-tertiary">{row.label}</span>
                                                <span className="font-medium text-ink-primary">{row.value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-surface-secondary rounded-xl p-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-ink-tertiary">{formatPrice(room.price, room.currency)} × {nights} nights</span>
                                            <span className="text-ink-primary">{formatPrice(subtotal, room.currency)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-ink-tertiary">Taxes & fees (7.5%)</span>
                                            <span className="text-ink-primary">{formatPrice(taxes, room.currency)}</span>
                                        </div>
                                        {room.breakfastIncluded && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-ink-tertiary">Breakfast</span>
                                                <span className="text-brand">Included</span>
                                            </div>
                                        )}
                                        <div className="border-t border-border pt-2 flex justify-between font-semibold">
                                            <span className="text-ink-primary">Total</span>
                                            <span className="text-ink-primary text-lg">{formatPrice(total, room.currency)}</span>
                                        </div>
                                    </div>

                                    {room.refundable && (
                                        <div className="flex items-center gap-2 text-sm text-brand bg-brand-50 px-3 py-2.5 rounded-lg">
                                            <Check size={14} />
                                            Free cancellation available on this room
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Navigation buttons */}
                            <div className="flex gap-3">
                                {step > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setStep((s) => s - 1)}
                                        className="btn-outline flex-1 py-3"
                                    >
                                        Back
                                    </button>
                                )}
                                {step < 2 ? (
                                    <button
                                        type="button"
                                        onClick={handleNext}
                                        className="btn-primary flex-1 py-3 text-base"
                                    >
                                        Continue →
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-primary flex-1 py-3 text-base disabled:opacity-60"
                                    >
                                        {isSubmitting ? 'Confirming…' : `Confirm & pay ${formatPrice(total, room.currency)}`}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right — booking summary */}
                        <aside className="lg:w-72 shrink-0">
                            <div className="card p-5 sticky top-24 space-y-4">
                                <div>
                                    <div className="w-full h-28 bg-surface-secondary rounded-xl flex items-center justify-center text-5xl mb-3">
                                        🏨
                                    </div>
                                    <h3 className="font-semibold text-ink-primary text-sm">{hotel.name}</h3>
                                    <div className="flex items-center gap-1 text-xs text-ink-tertiary mt-0.5">
                                        <Star size={11} className="text-amber-400 fill-amber-400" />
                                        {hotel.rating} · {hotel.location}
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-ink-tertiary">Room</span>
                                        <span className="font-medium text-ink-primary">{room.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-ink-tertiary">Check-in</span>
                                        <span className="font-medium text-ink-primary">{formatDate(checkIn)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-ink-tertiary">Check-out</span>
                                        <span className="font-medium text-ink-primary">{formatDate(checkOut)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-ink-tertiary">Guests</span>
                                        <span className="font-medium text-ink-primary">{guests}</span>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-4 space-y-1.5 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-ink-tertiary">{nights} nights</span>
                                        <span className="text-ink-primary">{formatPrice(subtotal, room.currency)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-ink-tertiary">Taxes</span>
                                        <span className="text-ink-primary">{formatPrice(taxes, room.currency)}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold pt-1 border-t border-border">
                                        <span>Total</span>
                                        <span className="text-brand">{formatPrice(total, room.currency)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-ink-tertiary bg-surface-secondary rounded-lg px-3 py-2.5">
                                    <Clock size={13} className="shrink-0" />
                                    Prices are held for 15 minutes
                                </div>
                            </div>
                        </aside>
                    </div>
                </form>
            </div>
        </div>
    )
}