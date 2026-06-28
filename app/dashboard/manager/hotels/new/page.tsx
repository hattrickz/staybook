'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, Plus, Trash2, Building2,
  MapPin, Star, DollarSign, Clock, Shield
} from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Navbar } from '@/components/layout/Navbar'
import { useAuthStore } from '@/lib/store/auth'
import { gqlFetch } from '@/lib/gql'
import { cn } from '@/lib/utils'
import type { Route } from 'next'
import { ImageUpload } from '@/components/ui/ImageUpload'

const AMENITY_OPTIONS = [
  { key: 'wifi', label: 'Free WiFi', icon: 'Wifi' },
  { key: 'pool', label: 'Swimming Pool', icon: 'Waves' },
  { key: 'gym', label: 'Fitness Center', icon: 'Dumbbell' },
  { key: 'spa', label: 'Spa', icon: 'Sparkles' },
  { key: 'restaurant', label: 'Restaurant', icon: 'UtensilsCrossed' },
  { key: 'bar', label: 'Bar & Lounge', icon: 'Wine' },
  { key: 'parking', label: 'Free Parking', icon: 'Car' },
  { key: 'airport_shuttle', label: 'Airport Shuttle', icon: 'Bus' },
  { key: 'room_service', label: 'Room Service', icon: 'Bell' },
  { key: 'breakfast', label: 'Breakfast', icon: 'Coffee' },
  { key: 'pet_friendly', label: 'Pet Friendly', icon: 'PawPrint' },
  { key: 'beach_access', label: 'Beach Access', icon: 'Umbrella' },
]

const schema = z.object({
  name: z.string().min(2, 'Hotel name is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  location: z.string().min(5, 'Full address is required'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  priceFrom: z.number().min(1, 'Starting price is required'),
  currency: z.string().min(1, 'Currency is required'),
  checkInTime: z.string().min(1, 'Check-in time is required'),
  checkOutTime: z.string().min(1, 'Check-out time is required'),
  amenities: z.array(z.string()).min(1, 'Select at least one amenity'),
  policies: z.array(z.string()),
  images: z.array(z.string()),
})

type FormValues = z.infer<typeof schema>

const CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR', 'AED', 'GHS', 'KES', 'ZAR']

const STEPS = ['Basic info', 'Location', 'Amenities', 'Policies', 'Review']

export default function NewHotelPage() {
  const router = useRouter()
  const { token, isAuthenticated } = useAuthStore()
  const [step, setStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [policies, setPolicies] = useState<string[]>([
    'No smoking inside rooms',
    'Valid ID required at check-in',
  ])
  const [newPolicy, setNewPolicy] = useState('')

  const { register, handleSubmit, trigger, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: 'NGN',
      checkInTime: '2:00 PM',
      checkOutTime: '12:00 PM',
      amenities: [],
      policies: [],
      images: [],
    },
  })

  const stepFields: Record<number, (keyof FormValues)[]> = {
    0: ['name', 'description', 'priceFrom', 'currency'],
    1: ['location', 'city', 'country'],
    2: ['amenities'],
    3: ['checkInTime', 'checkOutTime'],
  }

  const handleNext = async () => {
    const fields = stepFields[step]
    const valid = await trigger(fields)
    if (valid) setStep((s) => s + 1)
  }

  const toggleAmenity = (key: string) => {
    const updated = selectedAmenities.includes(key)
      ? selectedAmenities.filter((k) => k !== key)
      : [...selectedAmenities, key]
    setSelectedAmenities(updated)
    setValue('amenities', updated)
  }

  const addPolicy = () => {
    if (!newPolicy.trim()) return
    const updated = [...policies, newPolicy.trim()]
    setPolicies(updated)
    setValue('policies', updated)
    setNewPolicy('')
  }

  const removePolicy = (i: number) => {
    const updated = policies.filter((_, idx) => idx !== i)
    setPolicies(updated)
    setValue('policies', updated)
  }

  const onSubmit = async (values: FormValues) => {
    if (!isAuthenticated) {
      toast.error('Please log in as a manager')
      return
    }

    setIsSubmitting(true)
    try {
      const amenitiesInput = values.amenities.map((key) => {
        const found = AMENITY_OPTIONS.find((a) => a.key === key)
        return found ?? { key, label: key, icon: 'Check' }
      })

      const { data, errors: gqlErrors } = await gqlFetch(
        `mutation CreateHotel($input: CreateHotelInput!) {
          createHotel(input: $input) {
            id
            name
          }
        }`,
        {
          input: {
            name: values.name,
            description: values.description,
            location: values.location,
            city: values.city,
            country: values.country,
            priceFrom: values.priceFrom,
            currency: values.currency,
            checkInTime: values.checkInTime,
            checkOutTime: values.checkOutTime,
            amenities: amenitiesInput,
            policies: policies,
            images: [],
          },
        },
        token || ''
      )

      if (gqlErrors?.length) {
        toast.error(gqlErrors[0].message || 'Failed to create hotel')
        return
      }

      toast.success(`${data.createHotel.name} created successfully!`)
      router.push(`/dashboard/manager/hotels/${data.createHotel.id}/rooms` as Route)
    } catch (err) {
      toast.error('Could not create hotel. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const priceFrom = watch('priceFrom')
  const currency = watch('currency')
  const name = watch('name')
  const city = watch('city')
  const country = watch('country')

  return (
    <div className="min-h-screen bg-surface-tertiary">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href={'/dashboard/manager' as Route}
            className="flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink-primary"
          >
            <ChevronLeft size={16} /> Back
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-ink-primary">Add new hotel</h1>
            <p className="text-sm text-ink-tertiary mt-0.5">Fill in the details to list your property</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 shrink-0">
              <div className={cn(
                'flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full',
                i < step ? 'bg-brand text-white' :
                  i === step ? 'bg-ink-primary text-white' :
                    'bg-surface-secondary text-ink-tertiary'
              )}>
                <span>{i + 1}</span>
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('w-6 h-px shrink-0', i < step ? 'bg-brand' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Step 0 — Basic info */}
          {step === 0 && (
            <div className="card p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={18} className="text-brand" />
                <h2 className="font-semibold text-ink-primary">Basic information</h2>
              </div>

              <div>
                <label className="label">Hotel name</label>
                <input {...register('name')} className="input" placeholder="e.g. Grand Palace Hotel" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="input resize-none"
                  placeholder="Describe your hotel — facilities, atmosphere, unique features…"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Starting price per night</label>
                  <input
                    {...register('priceFrom', { valueAsNumber: true })}
                    type="number"
                    className="input"
                    placeholder="50000"
                  />
                  {errors.priceFrom && <p className="text-red-500 text-xs mt-1">{errors.priceFrom.message}</p>}
                </div>
                <div>
                  <label className="label">Currency</label>
                  <select {...register('currency')} className="input">
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Check-in time</label>
                  <input {...register('checkInTime')} className="input" placeholder="2:00 PM" />
                </div>
                <div>
                  <label className="label">Check-out time</label>
                  <input {...register('checkOutTime')} className="input" placeholder="12:00 PM" />
                </div>
              </div>
              <div>
                <label className="label">Hotel photos</label>
                <ImageUpload
                  value={images}
                  onChange={(urls) => { setImages(urls); setValue('images', urls) }}
                  maxImages={6}
                />
                <p className="text-xs text-ink-tertiary mt-1">
                  Upload up to 6 photos. First photo will be the cover image.
                </p>
              </div>
            </div>
          )}

          {/* Step 1 — Location */}
          {step === 1 && (
            <div className="card p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={18} className="text-brand" />
                <h2 className="font-semibold text-ink-primary">Location</h2>
              </div>

              <div>
                <label className="label">Full address</label>
                <input
                  {...register('location')}
                  className="input"
                  placeholder="e.g. Plot 1415 Adetokunbo Ademola Street, Victoria Island"
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City</label>
                  <input {...register('city')} className="input" placeholder="Lagos" />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="label">Country</label>
                  <input {...register('country')} className="input" placeholder="Nigeria" />
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Amenities */}
          {step === 2 && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <Star size={18} className="text-brand" />
                <h2 className="font-semibold text-ink-primary">Amenities</h2>
              </div>
              {errors.amenities && (
                <p className="text-red-500 text-xs mb-4">{errors.amenities.message}</p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AMENITY_OPTIONS.map((a) => {
                  const selected = selectedAmenities.includes(a.key)
                  return (
                    <button
                      key={a.key}
                      type="button"
                      onClick={() => toggleAmenity(a.key)}
                      className={cn(
                        'flex items-center gap-2.5 p-3 rounded-xl border text-sm font-medium transition-all text-left',
                        selected
                          ? 'border-brand bg-brand-50 text-brand'
                          : 'border-border bg-white text-ink-secondary hover:border-brand/40'
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded-md border flex items-center justify-center shrink-0',
                        selected ? 'bg-brand border-brand' : 'border-border'
                      )}>
                        {selected && <span className="text-white text-xs">✓</span>}
                      </div>
                      {a.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-ink-tertiary mt-4">
                {selectedAmenities.length} amenities selected
              </p>
            </div>
          )}

          {/* Step 3 — Policies */}
          {step === 3 && (
            <div className="card p-6 space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={18} className="text-brand" />
                <h2 className="font-semibold text-ink-primary">Hotel policies</h2>
              </div>

              <div className="space-y-2">
                {policies.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 bg-surface-secondary rounded-xl px-4 py-3">
                    <span className="text-brand text-sm">✓</span>
                    <span className="flex-1 text-sm text-ink-primary">{p}</span>
                    <button
                      type="button"
                      onClick={() => removePolicy(i)}
                      className="text-ink-tertiary hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  value={newPolicy}
                  onChange={(e) => setNewPolicy(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPolicy())}
                  className="input flex-1"
                  placeholder="Add a policy e.g. No pets allowed"
                />
                <button
                  type="button"
                  onClick={addPolicy}
                  className="btn-primary px-4 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Plus size={15} /> Add
                </button>
              </div>
            </div>
          )}

          {/* Step 4 — Review */}
          {step === 4 && (
            <div className="card p-6 space-y-5">
              <h2 className="font-semibold text-ink-primary mb-2">Review & publish</h2>

              <div className="bg-surface-secondary rounded-xl p-5 space-y-3">
                {[
                  { label: 'Hotel name', value: name },
                  { label: 'City', value: city },
                  { label: 'Country', value: country },
                  { label: 'Price from', value: `${currency} ${priceFrom?.toLocaleString()}/night` },
                  { label: 'Amenities', value: `${selectedAmenities.length} selected` },
                  { label: 'Policies', value: `${policies.length} policies` },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-ink-tertiary">{row.label}</span>
                    <span className="font-medium text-ink-primary">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-brand-50 rounded-xl p-4 text-sm text-brand">
                After publishing, you'll be taken to add rooms to this hotel.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="btn-outline flex-1 py-3"
              >
                Back
              </button>
            )}
            {step < 4 ? (
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
                {isSubmitting ? 'Publishing…' : 'Publish hotel →'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
