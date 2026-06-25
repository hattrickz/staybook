'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@apollo/client'
import { SlidersHorizontal, Grid3X3, List, X } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SearchBar } from '@/components/search/SearchBar'
import { HotelCard } from '@/components/hotel/HotelCard'
import { cn } from '@/lib/utils'
import { GET_HOTELS } from '@/graphql/queries'
import type { Hotel } from '@/types'

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most popular' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Highest rated' },
]

const AMENITY_OPTIONS = [
  { key: 'wifi', label: 'Free WiFi' },
  { key: 'pool', label: 'Swimming Pool' },
  { key: 'gym', label: 'Fitness Center' },
  { key: 'spa', label: 'Spa' },
  { key: 'restaurant', label: 'Restaurant' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'parking', label: 'Free Parking' },
  { key: 'pet_friendly', label: 'Pet Friendly' },
]

function HotelCardSkeleton({ variant }: { variant: 'grid' | 'list' }) {
  return (
    <div className={cn('card overflow-hidden animate-pulse', variant === 'list' && 'flex')}>
      <div className={cn('bg-surface-tertiary shrink-0', variant === 'list' ? 'w-64 h-48' : 'w-full h-52')} />
      <div className="p-4 flex-1 space-y-3">
        <div className="h-4 bg-surface-tertiary rounded w-3/4" />
        <div className="h-3 bg-surface-tertiary rounded w-1/2" />
        <div className="h-3 bg-surface-tertiary rounded w-1/3" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 w-14 bg-surface-tertiary rounded" />
          <div className="h-5 w-14 bg-surface-tertiary rounded" />
        </div>
        <div className="flex justify-between pt-3 border-t border-border">
          <div className="h-5 w-24 bg-surface-tertiary rounded" />
          <div className="h-5 w-20 bg-surface-tertiary rounded" />
        </div>
      </div>
    </div>
  )
}

function HotelsContent() {
  const searchParams = useSearchParams()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('popular')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [priceMax, setPriceMax] = useState(500000)
  const [selectedStars, setSelectedStars] = useState<number[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  const location = searchParams.get('location') || ''
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const guests = Number(searchParams.get('guests') || 1)

  const { data, loading, error, refetch } = useQuery(GET_HOTELS, {
    variables: {
      search: {
        location: location || undefined,
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
        guests: guests || undefined,
        priceMax: priceMax < 500000 ? priceMax : undefined,
        sortBy,
      },
    },
  })

  // Refetch when sort changes
  useEffect(() => { refetch() }, [sortBy])

  const hotels: Hotel[] = data?.hotels ?? []

  // Client-side star filter (can move to backend later)
  const filtered = hotels.filter((h) => {
    if (selectedStars.length > 0) {
      const rounded = Math.round(h.rating)
      if (!selectedStars.includes(rounded)) return false
    }
    return true
  })

  const toggleStar = (s: number) => setSelectedStars((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s])
  const toggleAmenity = (k: string) => setSelectedAmenities((p) => p.includes(k) ? p.filter((x) => x !== k) : [...p, k])
  const clearFilters = () => { setSelectedStars([]); setSelectedAmenities([]); setPriceMax(500000) }
  const activeFilters = selectedStars.length + selectedAmenities.length + (priceMax < 500000 ? 1 : 0)

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-ink-primary">Filters</h3>
        {activeFilters > 0 && (
          <button onClick={clearFilters} className="text-xs text-brand hover:underline flex items-center gap-1">
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Price */}
      <div>
        <h4 className="text-sm font-medium text-ink-primary mb-3">Max price per night</h4>
        <input
          type="range"
          min={10000}
          max={500000}
          step={5000}
          value={priceMax}
          onChange={(e) => setPriceMax(Number(e.target.value))}
          className="w-full accent-brand"
        />
        <div className="flex justify-between text-xs text-ink-tertiary mt-1">
          <span>₦10,000</span>
          <span className="font-medium text-ink-primary">
            {priceMax >= 500000 ? 'Any price' : `₦${priceMax.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Stars */}
      <div>
        <h4 className="text-sm font-medium text-ink-primary mb-3">Star rating</h4>
        {[5, 4, 3, 2].map((s) => (
          <label key={s} className="flex items-center gap-2 py-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedStars.includes(s)}
              onChange={() => toggleStar(s)}
              className="accent-brand w-4 h-4"
            />
            <span className="text-amber-400 text-sm">{'★'.repeat(s)}</span>
            <span className="text-sm text-ink-secondary">{s} stars</span>
          </label>
        ))}
      </div>

      {/* Amenities */}
      <div>
        <h4 className="text-sm font-medium text-ink-primary mb-3">Amenities</h4>
        {AMENITY_OPTIONS.map((a) => (
          <label key={a.key} className="flex items-center gap-2 py-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedAmenities.includes(a.key)}
              onChange={() => toggleAmenity(a.key)}
              className="accent-brand w-4 h-4"
            />
            <span className="text-sm text-ink-secondary">{a.label}</span>
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-tertiary">
      <Navbar />

      {/* Search bar */}
      <div className="bg-white border-b border-border px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto">
          <SearchBar variant="compact" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">

          {/* Sidebar — desktop */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="card p-5 sticky top-24">
              <FilterPanel />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">

            {/* Results header */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div>
                <h1 className="font-semibold text-ink-primary text-lg">
                  {location ? `Hotels in ${location}` : 'All hotels'}
                </h1>
                <p className="text-sm text-ink-tertiary">
                  {loading ? 'Searching…' : `${filtered.length} ${filtered.length === 1 ? 'property' : 'properties'} found`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile filter button */}
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 btn-outline py-2 text-sm relative"
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  {activeFilters > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand text-white text-xs rounded-full flex items-center justify-center">
                      {activeFilters}
                    </span>
                  )}
                </button>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input py-2 text-sm cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>

                {/* View mode — desktop only */}
                <div className="hidden sm:flex border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn('p-2', viewMode === 'grid' ? 'bg-brand text-white' : 'text-ink-secondary hover:bg-surface-secondary')}
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn('p-2', viewMode === 'list' ? 'bg-brand text-white' : 'text-ink-secondary hover:bg-surface-secondary')}
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="card p-6 text-center text-ink-tertiary text-sm">
                Could not load hotels. Make sure the backend is running.
              </div>
            )}

            {/* Hotel grid/list */}
            {!error && (
              <div className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                  : 'flex flex-col gap-4'
              )}>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    <HotelCardSkeleton key={i} variant={viewMode} />
                  ))
                  : filtered.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} variant={viewMode} />
                  ))
                }
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && filtered.length === 0 && (
              <div className="card p-12 text-center">
                <p className="text-4xl mb-3">🏨</p>
                <h3 className="font-semibold text-ink-primary mb-1">No hotels found</h3>
                <p className="text-sm text-ink-tertiary mb-4">
                  Try adjusting your filters or search a different location
                </p>
                <button onClick={clearFilters} className="btn-primary">
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink-primary text-lg">Filters</h2>
              <button
                onClick={() => setFiltersOpen(false)}
                className="p-2 rounded-lg hover:bg-surface-secondary"
              >
                <X size={20} />
              </button>
            </div>
            <FilterPanel />
            <button
              onClick={() => setFiltersOpen(false)}
              className="btn-primary w-full mt-6 py-3"
            >
              Show {filtered.length} results
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default function HotelsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HotelsContent />
    </Suspense>
  )
}