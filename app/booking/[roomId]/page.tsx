'use client'

import { useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useQuery } from '@apollo/client'
import Link from 'next/link'
import {
    ChevronLeft, Check, CreditCard, User, Mail,
    Phone, MessageSquare, Shield, Clock, Star
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Navbar } from '@/components/layout/Navbar'
import { cn, formatPrice, formatDate, nightsBetween } from '@/lib/utils'
import { useAuthStore } from '@/lib/store/auth'
import { GET_HOTEL } from '@/graphql/queries'

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

const STEPS = ['Guest details', 'Payment', 'Confirm']

export default function BookingPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { user, token, isAuthenticated } = useAuthStore()

    const roomId = params.roomId as string
    const checkIn = searchParams.get('checkIn') || new Date().toISOString().split('T')[0]
    const checkOut = searchParams.get('checkOut') || (() => {
        const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split('T')[0]
    })()
    const guests = Number(searchParams.get('guests') || 2)
    const nights = nightsBetween(checkIn, checkOut) || 1

    const [step, setStep] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [confirmed, setConfirmed] = useState(false)
    const [confirmationCode, setConfirmationCode] = useState('')
    const [bookingData, setBookingData] = useState<any>(null)

    // We need the hotel ID to fetch hotel info — get it from the URL or query
    // For now fetch all hotels and find the room
    const hotelId = searchParams.get('hotelId') || ''

    const { register, handleSubmit, trigger, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: user?.name?.split(' ')[0] || '',
            lastName: user?.name?.split(' ')[1] || '',
            email: user?.email || '',
        },
    })

    const guestFields = ['firstName', 'lastName', 'email', 'phone'] as const
    const paymentFields = ['cardNumber', 'cardName', 'cardExpiry', 'cardCvc'] as const

    const handleNext = async () => {
        const fields = step === 0 ? guestFields : paymentFields
        const valid = await trigger(fields)
        if (valid) setStep((s) => s + 1)
    }

    const onSubmit = async (_values: FormValues) => {
        if (!isAuthenticated) {
            toast.error('Please log in to complete your booking')
            router.push('/auth/login')
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch('http://localhost:4000/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    query: `
            mutation CreateBooking($input: CreateBookingInput!) {
              createBooking(input: $input) {
                id
                confirmationCode
                totalPrice
                currency
                checkIn
                checkOut
                status
                room {
                  name
                  hotel { name location }
                }
              }
            }
          `,
                    variables: {
                        input: {
                            roomId,
                            checkIn,
                            checkOut,
                            guests,
                            specialRequests: _values.specialRequests || null,
                        },
                    },
                }),
            })

            const { data, errors } = await res.json()

            if (errors?.length) {
                toast.error(errors[0].message || 'Booking failed')
                return
            }

            setConfirmationCode(data.createBooking.confirmationCode)
            setBookingData(data.createBooking)
            setConfirmed(true)
            toast.success('Booking confirmed!')
        } catch (err) {
            toast.error('Could not complete booking. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    // We need room price — get it from hotelId query or pass via searchParams
    const price = Number(searchParams.get('price') || 0)
    const currency = searchParams.get('currency') || 'NGN'
    const roomName = searchParams.get('roomName') || 'Selected Room'
    const hotelName = searchParams.get('hotelName') || 'Hotel'

    const subtotal = price * nights
    const taxes = Math.round(subtotal * 0.075)
    const total = subtotal + taxes

    // ── Confirmation screen ───────────────────────────────────────────────────
    if (confirmed && bookingData) {
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
                            Your reservation at{' '}
                            <span className="font-medium text-ink-primary">
                                {bookingData.room?.hotel?.name}
                            </span>{' '}
                            is confirmed. A confirmation email has been sent.
                        </p>

                        <div className="bg-surface-secondary rounded-xl p-5 text-left space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-ink-tertiary">Confirmation code</span>
                                <span className="font-semibold text-brand">{bookingData.confirmationCode}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-ink-tertiary">Hotel</span>
                                <span className="font-medium text-ink-primary">{bookingData.room?.hotel?.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-ink-tertiary">Room</span>
                                <span className="font-medium text-ink-primary">{bookingData.room?.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-ink-tertiary">Check-in</span>
                                <span className="font-medium text-ink-primary">{formatDate(bookingData.checkIn)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-ink-tertiary">Check-out</span>
                                <span className="font-medium text-ink-primary">{formatDate(bookingData.checkOut)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-ink-tertiary">Guests</span>
                                <span className="font-medium text-ink-primary">{guests}</span>
                            </div>
                            <div className="border-t border-border pt-3 flex justify-between">
                                <span className="text-ink-tertiary text-sm">Total paid</span>
                                <span className="font-semibold text-ink-primary">
                                    {formatPrice(bookingData.totalPrice, bookingData.currency)}
                                </span>
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
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink-primary transition-colors"
                    >
                        <ChevronLeft size={16} /> Back
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 justify-center">
                            {STEPS.map((label, i) => (
                                <div key={label} className="flex items-center gap-2">
                                    <div className={cn(
                                        'flex items-center gap-1.5 text-xs font-medium',
                                        i < step ? 'text-brand' :
                                            i === step ? 'text-ink-primary' : 'text-ink-tertiary'
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

            {/* Auth warning */}
            {!isAuthenticated && (
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
                        <Shield size={15} />
                        You need to{' '}
                        <Link href="/auth/login" className="font-medium underline">log in</Link>
                        {' '}to complete your booking.
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* Left — form */}
                        <div className="flex-1 min-w-0 space-y-6">

                            {/* Step 0 — Guest details */}
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
                                            <label className="label">
                                                Special requests{' '}
                                                <span className="text-ink-tertiary font-normal normal-case">(optional)</span>
                                            </label>
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

                            {/* Step 1 — Payment */}
                            {step === 1 && (
                                <div className="card p-6">
                                    <div className="flex items-center gap-2 mb-5">
                                        <CreditCard size={18} className="text-brand" />
                                        <h2 className="font-semibold text-ink-primary">Payment details</h2>
                                    </div>
                                    <div className="flex items-center gap-2 bg-brand-50 text-brand text-xs px-3 py-2.5 rounded-lg mb-5">
                                        <Shield size={13} />
                                        Your payment info is encrypted and secure. You won't be charged until you confirm.
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="label">Card number</label>
                                            <div className="relative">
                                                <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                                                <input {...register('cardNumber')} className="input pl-9" placeholder="1234 5678 9012 3456" maxLength={19} />
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

                            {/* Step 2 — Review */}
                            {step === 2 && (
                                <div className="card p-6 space-y-5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Check size={18} className="text-brand" />
                                        <h2 className="font-semibold text-ink-primary">Review your booking</h2>
                                    </div>
                                    <div className="bg-surface-secondary rounded-xl p-4 space-y-3">
                                        {[
                                            { label: 'Hotel', value: hotelName },
                                            { label: 'Room', value: roomName },
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
                                            <span className="text-ink-tertiary">
                                                {formatPrice(price, currency)} × {nights} nights
                                            </span>
                                            <span className="text-ink-primary">{formatPrice(subtotal, currency)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-ink-tertiary">Taxes & fees (7.5%)</span>
                                            <span className="text-ink-primary">{formatPrice(taxes, currency)}</span>
                                        </div>
                                        <div className="border-t border-border pt-2 flex justify-between font-semibold">
                                            <span className="text-ink-primary">Total</span>
                                            <span className="text-ink-primary text-lg">{formatPrice(total, currency)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex gap-3">
                                {step > 0 && (
                                    <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-outline flex-1 py-3">
                                        Back
                                    </button>
                                )}
                                {step < 2 ? (
                                    <button type="button" onClick={handleNext} className="btn-primary flex-1 py-3 text-base">
                                        Continue →
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-primary flex-1 py-3 text-base disabled:opacity-60"
                                    >
                                        {isSubmitting ? 'Confirming…' : `Confirm & pay ${formatPrice(total, currency)}`}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right — summary */}
                        <aside className="lg:w-72 shrink-0">
                            <div className="card p-5 sticky top-24 space-y-4">
                                <div className="w-full h-28 bg-surface-secondary rounded-xl flex items-center justify-center text-5xl">
                                    🏨
                                </div>
                                <div>
                                    <h3 className="font-semibold text-ink-primary text-sm">{hotelName}</h3>
                                    <p className="text-xs text-ink-tertiary mt-0.5">{roomName}</p>
                                </div>
                                <div className="border-t border-border pt-4 space-y-2 text-sm">
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
                                        <span className="text-ink-primary">{formatPrice(subtotal, currency)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-ink-tertiary">Taxes</span>
                                        <span className="text-ink-primary">{formatPrice(taxes, currency)}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold pt-1 border-t border-border">
                                        <span>Total</span>
                                        <span className="text-brand">{formatPrice(total, currency)}</span>
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