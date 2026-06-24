'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, CalendarDays, Users, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSearchStore } from '@/lib/store/search'

interface SearchBarProps {
  variant?: 'hero' | 'compact'
  className?: string
}

export function SearchBar({ variant = 'hero', className }: SearchBarProps) {
  const router = useRouter()
  const { params, setParams } = useSearchStore()

  const handleSearch = () => {
    const query = new URLSearchParams({
      location: params.location,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      guests: String(params.guests),
    })
    router.push(`/hotels?${query.toString()}`)
  }

  const isHero = variant === 'hero'

  return (
    <div
      className={cn(
        'bg-white border border-border rounded-2xl shadow-elevated overflow-hidden',
        isHero ? 'p-4 md:p-5' : 'p-3',
        className
      )}
    >
      <div className={cn(
        'flex flex-col md:flex-row gap-0',
        isHero ? 'md:divide-x divide-border' : 'md:divide-x divide-border'
      )}>
        {/* Location */}
        <div className={cn('flex items-center gap-3 flex-1', isHero ? 'px-4 py-2' : 'px-3 py-1.5')}>
          <MapPin size={18} className="text-brand shrink-0" />
          <div className="flex-1 min-w-0">
            <label className="label">Location</label>
            <input
              type="text"
              placeholder="Where are you going?"
              value={params.location}
              onChange={(e) => setParams({ location: e.target.value })}
              className="w-full border-none outline-none text-sm text-ink-primary placeholder:text-ink-tertiary bg-transparent"
            />
          </div>
        </div>

        {/* Check in */}
        <div className={cn('flex items-center gap-3', isHero ? 'px-4 py-2' : 'px-3 py-1.5')}>
          <CalendarDays size={18} className="text-brand shrink-0" />
          <div>
            <label className="label">Check in</label>
            <input
              type="date"
              value={params.checkIn}
              onChange={(e) => setParams({ checkIn: e.target.value })}
              className="border-none outline-none text-sm text-ink-primary bg-transparent"
            />
          </div>
        </div>

        {/* Check out */}
        <div className={cn('flex items-center gap-3', isHero ? 'px-4 py-2' : 'px-3 py-1.5')}>
          <CalendarDays size={18} className="text-brand shrink-0" />
          <div>
            <label className="label">Check out</label>
            <input
              type="date"
              value={params.checkOut}
              onChange={(e) => setParams({ checkOut: e.target.value })}
              className="border-none outline-none text-sm text-ink-primary bg-transparent"
            />
          </div>
        </div>

        {/* Guests */}
        <div className={cn('flex items-center gap-3', isHero ? 'px-4 py-2' : 'px-3 py-1.5')}>
          <Users size={18} className="text-brand shrink-0" />
          <div>
            <label className="label">Guests</label>
            <select
              value={params.guests}
              onChange={(e) => setParams({ guests: Number(e.target.value) })}
              className="border-none outline-none text-sm text-ink-primary bg-transparent cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search button */}
        <div className={cn('flex items-center', isHero ? 'px-4 py-2' : 'px-3 py-1.5')}>
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 bg-brand hover:bg-brand-600 text-white font-medium px-6 py-3 rounded-xl transition-colors duration-150 text-sm whitespace-nowrap"
          >
            <Search size={16} />
            {isHero ? 'Search hotels' : 'Search'}
          </button>
        </div>
      </div>
    </div>
  )
}
