import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, Wifi, Car, Coffee } from 'lucide-react'
import { cn, formatPrice, ratingLabel } from '@/lib/utils'
import type { Hotel } from '@/types'

interface HotelCardProps {
  hotel: Hotel
  className?: string
  variant?: 'grid' | 'list'
}

export function HotelCard({ hotel, className, variant = 'grid' }: HotelCardProps) {
  const isList = variant === 'list'

  return (
    <Link
      href={`/hotel/${hotel.id}`}
      className={cn(
        'card group block overflow-hidden hover:shadow-elevated transition-shadow duration-200',
        isList ? 'flex' : 'flex-col',
        className
      )}
    >
      {/* Image */}
      <div className={cn(
        'relative overflow-hidden bg-surface-tertiary shrink-0',
        isList ? 'w-64 h-48' : 'w-full h-52'
      )}>
        {hotel.images?.[0] ? (
          <Image
            src={hotel.images[0]}
            alt={hotel.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🏨</div>
        )}
        {hotel.featured && (
          <span className="absolute top-3 left-3 bg-brand text-white text-xs font-medium px-2 py-1 rounded-md">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-ink-primary text-base leading-snug group-hover:text-brand transition-colors">
            {hotel.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0 bg-brand-50 text-brand text-xs font-semibold px-2 py-1 rounded-md">
            <Star size={11} fill="currentColor" />
            {hotel.rating.toFixed(1)}
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-ink-tertiary">
          <MapPin size={13} />
          {hotel.location}
        </p>

        <p className="text-xs text-ink-tertiary">
          {ratingLabel(hotel.rating)} · {hotel.reviewCount.toLocaleString()} reviews
        </p>

        {/* Amenity chips */}
        <div className="flex gap-1.5 flex-wrap mt-1">
          {hotel.amenities?.slice(0, 3).map((a) => (
            <span key={a.key} className="badge bg-surface-secondary text-ink-secondary">
              {a.label}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-end justify-between mt-auto pt-3 border-t border-border">
          <div>
            <span className="text-lg font-semibold text-ink-primary">
              {formatPrice(hotel.priceFrom, hotel.currency)}
            </span>
            <span className="text-xs text-ink-tertiary"> / night</span>
          </div>
          <span className="text-sm font-medium text-brand">View rooms →</span>
        </div>
      </div>
    </Link>
  )
}
