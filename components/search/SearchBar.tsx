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
  const [expanded, setExpanded] = useState(false)

  const handleSearch = () => {
    if (!params.location.trim()) return
    const query = new URLSearchParams({
      location: params.location,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      guests: String(params.guests),
    })
    router.push(`/hotels?${query.toString()}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className={cn('w-full', className)}>

      {/* ── Mobile search bar ── */}
      <div className="md:hidden">
        {!expanded ? (
          /* Collapsed pill */
          <button
            onClick={() => setExpanded(true)}
            className="w-full flex items-center gap-3 bg-white border border-border rounded-2xl px-4 py-3.5 shadow-elevated text-left"
          >
            <Search size={18} className="text-brand shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-primary truncate">
                {params.location || 'Where are you going?'}
              </p>
              <p className="text-xs text-ink-tertiary mt-0.5">
                {params.checkIn} · {params.guests} guests
              </p>
            </div>
          </button>
        ) : (
          /* Expanded form */
          <div className="bg-white border border-border rounded-2xl shadow-elevated overflow-hidden">
            {/* Location */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <MapPin size={16} className="text-brand shrink-0" />
              <div className="flex-1">
                <label className="label">Location</label>
                <input
                  type="text"
                  placeholder="Where are you going?"
                  value={params.location}
                  onChange={(e) => setParams({ location: e.target.value })}
                  onKeyDown={handleKeyDown}
                  className="w-full border-none outline-none text-sm text-ink-primary placeholder:text-ink-tertiary bg-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Dates row */}
            <div className="grid grid-cols-2 border-b border-border">
              <div className="flex items-center gap-2 px-4 py-3 border-r border-border">
                <CalendarDays size={16} className="text-brand shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="label">Check in</label>
                  <input
                    type="date"
                    value={params.checkIn}
                    onChange={(e) => setParams({ checkIn: e.target.value })}
                    className="w-full border-none outline-none text-sm text-ink-primary bg-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-3">
                <CalendarDays size={16} className="text-brand shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="label">Check out</label>
                  <input
                    type="date"
                    value={params.checkOut}
                    onChange={(e) => setParams({ checkOut: e.target.value })}
                    className="w-full border-none outline-none text-sm text-ink-primary bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Guests + button */}
            <div className="flex items-center gap-3 px-4 py-3">
              <Users size={16} className="text-brand shrink-0" />
              <div className="flex-1">
                <label className="label">Guests</label>
                <select
                  value={params.guests}
                  onChange={(e) => setParams({ guests: Number(e.target.value) })}
                  className="w-full border-none outline-none text-sm text-ink-primary bg-transparent"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setExpanded(false)}
                  className="px-3 py-2 rounded-xl text-sm text-ink-secondary hover:bg-surface-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { handleSearch(); setExpanded(false) }}
                  className="flex items-center gap-1.5 bg-brand hover:bg-brand-600 text-white font-medium px-4 py-2 rounded-xl transition-colors text-sm"
                >
                  <Search size={15} />
                  Search
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Desktop search bar ── */}
      <div className={cn(
        'hidden md:block bg-white border border-border rounded-2xl shadow-elevated overflow-hidden',
        variant === 'hero' ? 'p-2' : 'p-1.5'
      )}>
        <div className="flex items-stretch divide-x divide-border">

          {/* Location */}
          <div className={cn('flex items-center gap-3 flex-1', variant === 'hero' ? 'px-5 py-2' : 'px-4 py-1.5')}>
            <MapPin size={17} className="text-brand shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="label">Location</label>
              <input
                type="text"
                placeholder="Where are you going?"
                value={params.location}
                onChange={(e) => setParams({ location: e.target.value })}
                onKeyDown={handleKeyDown}
                className="w-full border-none outline-none text-sm text-ink-primary placeholder:text-ink-tertiary bg-transparent"
              />
            </div>
          </div>

          {/* Check in */}
          <div className={cn('flex items-center gap-3', variant === 'hero' ? 'px-5 py-2' : 'px-4 py-1.5')}>
            <CalendarDays size={17} className="text-brand shrink-0" />
            <div>
              <label className="label">Check in</label>
              <input
                type="date"
                value={params.checkIn}
                onChange={(e) => setParams({ checkIn: e.target.value })}
                className="border-none outline-none text-sm text-ink-primary bg-transparent w-32"
              />
            </div>
          </div>

          {/* Check out */}
          <div className={cn('flex items-center gap-3', variant === 'hero' ? 'px-5 py-2' : 'px-4 py-1.5')}>
            <CalendarDays size={17} className="text-brand shrink-0" />
            <div>
              <label className="label">Check out</label>
              <input
                type="date"
                value={params.checkOut}
                onChange={(e) => setParams({ checkOut: e.target.value })}
                className="border-none outline-none text-sm text-ink-primary bg-transparent w-32"
              />
            </div>
          </div>

          {/* Guests */}
          <div className={cn('flex items-center gap-3', variant === 'hero' ? 'px-5 py-2' : 'px-4 py-1.5')}>
            <Users size={17} className="text-brand shrink-0" />
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
          <div className={cn('flex items-center', variant === 'hero' ? 'px-3 py-2' : 'px-2 py-1.5')}>
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 bg-brand hover:bg-brand-600 text-white font-medium px-5 py-3 rounded-xl transition-colors duration-150 text-sm whitespace-nowrap"
            >
              <Search size={16} />
              {variant === 'hero' ? 'Search hotels' : 'Search'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}