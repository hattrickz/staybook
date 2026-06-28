'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Plus, Trash2, BedDouble, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Navbar } from '@/components/layout/Navbar'
import { useAuthStore } from '@/lib/store/auth'
import { gqlFetch } from '@/lib/gql'
import { cn, formatPrice } from '@/lib/utils'
import type { Route } from 'next'
import { ImageUpload } from '@/components/ui/ImageUpload'

const ROOM_TYPES = ['standard', 'deluxe', 'suite', 'presidential', 'family']
const BED_TYPES = ['single', 'double', 'queen', 'king', 'twin']
const CURRENCIES = ['NGN', 'USD', 'GBP', 'EUR', 'AED', 'GHS', 'KES', 'ZAR']

const ROOM_AMENITIES = [
  'Free WiFi', 'Air conditioning', 'Flat-screen TV', 'Mini fridge',
  'Mini bar', 'Safe', 'Balcony', 'Ocean view', 'City view', 'Jacuzzi',
  'Butler service', 'Kitchen', 'Living area', 'Sofa bed',
]

const schema = z.object({
  name: z.string().min(2, 'Room name is required'),
  roomType: z.string().min(1, 'Room type is required'),
  bedType: z.string().min(1, 'Bed type is required'),
  price: z.number().min(1, 'Price is required'),
  currency: z.string().min(1, 'Currency is required'),
  capacity: z.number().min(1).max(10),
  size: z.number().min(1, 'Room size is required'),
  description: z.string().min(10, 'Description is required'),
  refundable: z.boolean(),
  breakfastIncluded: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface AddedRoom {
  id: string
  name: string
  roomType: string
  price: number
  currency: string
  capacity: number
}

export default function AddRoomsPage() {
  const params = useParams()
  const router = useRouter()
  const { token } = useAuthStore()
  const hotelId = params.hotelId as string

  const [addedRooms, setAddedRooms] = useState<AddedRoom[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [roomImages, setRoomImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(true)

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: 'NGN',
      capacity: 2,
      size: 30,
      refundable: true,
      breakfastIncluded: false,
      roomType: 'standard',
      bedType: 'queen',
    },
  })

  const price = watch('price')
  const currency = watch('currency')

  const toggleAmenity = (a: string) =>
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    )

  const onAddRoom = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      const { data, errors: gqlErrors } = await gqlFetch(
        `mutation CreateRoom($input: CreateRoomInput!) {
          createRoom(input: $input) {
            id
            name
            roomType
            price
            currency
            capacity
          }
        }`,
        {
          input: {
            hotelId,
            name: values.name,
            roomType: values.roomType,
            bedType: values.bedType,
            price: values.price,
            currency: values.currency,
            capacity: values.capacity,
            size: values.size,
            description: values.description,
            refundable: values.refundable,
            breakfastIncluded: values.breakfastIncluded,
            amenities: selectedAmenities,
            images: roomImages,
          },
        },
        token || ''
      )

      if (gqlErrors?.length) {
        toast.error(gqlErrors[0].message || 'Failed to add room')
        return
      }

      setAddedRooms((prev) => [...prev, data.createRoom])
      toast.success(`${data.createRoom.name} added!`)
      reset()
      setRoomImages([])
      setSelectedAmenities([])
      setShowForm(false)
    } catch (err) {
      toast.error('Could not add room.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-tertiary">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex items-center gap-3 mb-8">
          <Link href={'/dashboard/manager' as Route} className="flex items-center gap-1.5 text-sm text-ink-secondary hover:text-ink-primary">
            <ChevronLeft size={16} /> Dashboard
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-ink-primary">Add rooms</h1>
            <p className="text-sm text-ink-tertiary mt-0.5">Add rooms to your new hotel</p>
          </div>
        </div>

        {/* Added rooms list */}
        {addedRooms.length > 0 && (
          <div className="card p-5 mb-6">
            <h2 className="font-semibold text-ink-primary mb-4 flex items-center gap-2">
              <Check size={16} className="text-brand" />
              Rooms added ({addedRooms.length})
            </h2>
            <div className="space-y-3">
              {addedRooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between bg-surface-secondary rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <BedDouble size={16} className="text-brand" />
                    <div>
                      <p className="font-medium text-ink-primary text-sm">{room.name}</p>
                      <p className="text-xs text-ink-tertiary capitalize">{room.roomType} · Up to {room.capacity} guests</p>
                    </div>
                  </div>
                  <span className="font-semibold text-ink-primary text-sm">
                    {formatPrice(room.price, room.currency)}/night
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add room form */}
        {showForm ? (
          <form onSubmit={handleSubmit(onAddRoom)} className="card p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <BedDouble size={18} className="text-brand" />
              <h2 className="font-semibold text-ink-primary">Room details</h2>
            </div>

            <div>
              <label className="label">Room name</label>
              <input {...register('name')} className="input" placeholder="e.g. Deluxe King Room" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Room type</label>
                <select {...register('roomType')} className="input capitalize">
                  {ROOM_TYPES.map((t) => (
                    <option key={t} value={t} className="capitalize">{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Bed type</label>
                <select {...register('bedType')} className="input capitalize">
                  {BED_TYPES.map((b) => (
                    <option key={b} value={b} className="capitalize">{b}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Price per night</label>
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  className="input"
                  placeholder="50000"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="label">Currency</label>
                <select {...register('currency')} className="input">
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Max guests</label>
                <input
                  {...register('capacity', { valueAsNumber: true })}
                  type="number"
                  min={1}
                  max={10}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Room size (m²)</label>
                <input
                  {...register('size', { valueAsNumber: true })}
                  type="number"
                  className="input"
                  placeholder="30"
                />
                {errors.size && <p className="text-red-500 text-xs mt-1">{errors.size.message}</p>}
              </div>
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className="input resize-none"
                placeholder="Describe this room…"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="label">Room photos</label>
              <ImageUpload
                value={roomImages}
                onChange={setRoomImages}
                maxImages={4}
              />
            </div>

            {/* Amenities */}
            <div>
              <label className="label">Room amenities</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {ROOM_AMENITIES.map((a) => {
                  const selected = selectedAmenities.includes(a)
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left',
                        selected
                          ? 'border-brand bg-brand-50 text-brand'
                          : 'border-border bg-white text-ink-secondary hover:border-brand/40'
                      )}
                    >
                      <div className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                        selected ? 'bg-brand border-brand' : 'border-border'
                      )}>
                        {selected && <span className="text-white text-xs">✓</span>}
                      </div>
                      {a}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Options */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register('refundable')} type="checkbox" className="accent-brand w-4 h-4" />
                <span className="text-sm text-ink-secondary">Free cancellation</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register('breakfastIncluded')} type="checkbox" className="accent-brand w-4 h-4" />
                <span className="text-sm text-ink-secondary">Breakfast included</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3 text-base disabled:opacity-60"
            >
              {isSubmitting ? 'Adding room…' : `Add room ${price ? `· ${formatPrice(price, currency)}/night` : ''}`}
            </button>
          </form>
        ) : (
          <div className="card p-6 text-center">
            <p className="text-ink-secondary text-sm mb-4">Want to add another room?</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <Plus size={15} /> Add another room
            </button>
          </div>
        )}

        {/* Done button */}
        {addedRooms.length > 0 && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="btn-outline flex-1 py-3 flex items-center justify-center gap-2"
            >
              <Plus size={15} /> Add another room
            </button>
            <button
              onClick={() => router.push('/dashboard/manager' as Route)}
              className="btn-primary flex-1 py-3"
            >
              Done — Go to dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
