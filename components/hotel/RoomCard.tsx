'use client'

import Image from 'next/image'
import { Bed, Users, Maximize2, Wifi, Coffee, RotateCcw, Check, X } from 'lucide-react'
import { cn, formatPrice, ROOM_TYPE_LABELS } from '@/lib/utils'
import type { Room } from '@/types'

interface RoomCardProps {
  room: Room
  checkIn: string
  checkOut: string
  nights: number
  onReserve: (room: Room) => void
}

export function RoomCard({ room, checkIn, checkOut, nights, onReserve }: RoomCardProps) {
  const totalPrice = room.price * nights

  return (
    <div className={cn(
      'card overflow-hidden transition-all duration-200',
      !room.available && 'opacity-60'
    )}>
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative w-full md:w-56 h-44 md:h-auto shrink-0 bg-surface-tertiary">
          {room.images?.[0] ? (
            <Image src={room.images[0]} alt={room.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🛏️</div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="badge bg-brand-50 text-brand mb-1.5">
                {ROOM_TYPE_LABELS[room.roomType]}
              </span>
              <h3 className="font-semibold text-ink-primary text-base">{room.name}</h3>
            </div>
          </div>

          <p className="text-sm text-ink-secondary leading-relaxed">{room.description}</p>

          {/* Room specs */}
          <div className="flex items-center gap-4 text-sm text-ink-secondary">
            <span className="flex items-center gap-1.5">
              <Bed size={15} /> {room.bedType} bed
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={15} /> Up to {room.capacity}
            </span>
            <span className="flex items-center gap-1.5">
              <Maximize2 size={15} /> {room.size} m²
            </span>
          </div>

          {/* Features */}
          <div className="flex gap-3 text-xs text-ink-secondary">
            <span className={cn('flex items-center gap-1', room.refundable ? 'text-brand' : 'text-ink-tertiary')}>
              {room.refundable ? <Check size={13} /> : <X size={13} />}
              {room.refundable ? 'Free cancellation' : 'Non-refundable'}
            </span>
            <span className={cn('flex items-center gap-1', room.breakfastIncluded ? 'text-brand' : 'text-ink-tertiary')}>
              {room.breakfastIncluded ? <Check size={13} /> : <X size={13} />}
              {room.breakfastIncluded ? 'Breakfast included' : 'No breakfast'}
            </span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="md:w-48 p-5 flex flex-col items-end justify-between border-t md:border-t-0 md:border-l border-border">
          <div className="text-right">
            <div className="text-2xl font-semibold text-ink-primary">
              {formatPrice(room.price, room.currency)}
            </div>
            <div className="text-xs text-ink-tertiary">per night</div>
            {nights > 1 && (
              <div className="text-sm font-medium text-ink-secondary mt-1">
                {formatPrice(totalPrice, room.currency)} total
              </div>
            )}
          </div>

          <button
            onClick={() => room.available && onReserve(room)}
            disabled={!room.available}
            className={cn(
              'w-full mt-4 font-medium text-sm py-2.5 rounded-lg transition-colors duration-150',
              room.available
                ? 'bg-brand hover:bg-brand-600 text-white'
                : 'bg-surface-tertiary text-ink-tertiary cursor-not-allowed'
            )}
          >
            {room.available ? 'Reserve' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  )
}
