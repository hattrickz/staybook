'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal, Grid3X3, List, ChevronDown } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SearchBar } from '@/components/search/SearchBar'
import { HotelCard } from '@/components/hotel/HotelCard'
import { cn } from '@/lib/utils'
import type { Hotel } from '@/types'

// Placeholder data — replace with useQuery(GET_HOTELS) when backend is ready
const MOCK_HOTELS: Hotel[] = [
  {
    id: '1', name: 'Transcorp Hilton Abuja', description: 'The iconic 5-star hotel in the heart of Abuja.',
    location: 'Abuja, Nigeria', city: 'Abuja', country: 'Nigeria',
    rating: 4.8, reviewCount: 1240, images: [],
    amenities: [
      { key: 'pool', label: 'Pool', icon: 'Waves' },
      { key: 'wifi', label: 'Free WiFi', icon: 'Wifi' },
      { key: 'restaurant', label: 'Restaurant', icon: 'UtensilsCrossed' },
    ],
    managerId: '1', priceFrom: 150000, currency: 'NGN', featured: true,
  },
  {
    id: '2', name: 'Eko Hotel & Suites', description: 'A premium resort experience in Lagos.',
    location: 'Lagos, Nigeria', city: 'Lagos', country: 'Nigeria',
    rating: 4.6, reviewCount: 892, images: [],
    amenities: [
      { key: 'spa', label: 'Spa', icon: 'Sparkles' },
      { key: 'pool', label: 'Pool', icon: 'Waves' },
      { key: 'bar', label: 'Bar', icon: 'Wine' },
    ],
    managerId: '2', priceFrom: 95000, currency: 'NGN',
  },
  {
    id: '3', name: 'Sheraton Abuja', description: 'Modern comfort in Nigeria\'s capital city.',
    location: 'Abuja, Nigeria', city: 'Abuja', country: 'Nigeria',
    rating: 4.4, reviewCount: 670, images: [],
    amenities: [
      { key: 'gym', label: 'Gym', icon: 'Dumbbell' },
      { key: 'wifi', label: 'Free WiFi', icon: 'Wifi' },
      { key: 'breakfast', label: 'Breakfast', icon: 'Coffee' },
    ],
    managerId: '3', priceFrom: 80000, currency: 'NGN',
  },
  {
    id: '4', name: 'Radisson Blu Anchorage', description: 'Waterfront luxury in Lagos.',
    location: 'Lagos, Nigeria', city: 'Lagos', country: 'Nigeria',
    rating: 4.5, reviewCount: 540, images: [],
    amenities: [
      { key: 'pool', label: 'Pool', icon: 'Waves' },
      { key: 'restaurant', label: 'Restaurant', icon: 'UtensilsCrossed' },
      { key: 'parking', label: 'Parking', icon: 'Car' },
    ],
    managerId: '4', priceFrom: 120000, currency: 'NGN',
  },
]

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most popular' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Highest rated' },
]

const STAR_OPTIONS = [5, 4, 3, 2]
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

export default function HotelsPage() {
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('popular')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 500000])
  const [selectedStars, setSelectedStars] = useState<number[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])

  const location = searchParams.get('location') || ''

  const toggleStar = (s: number) =>
    setSelectedStars((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])

  const toggleAmenity = (k: string) =>
    setSelectedAmenities((prev) => prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k])

  return (
    <div className="min-h-screen bg-surface-tertiary">
      <Navbar />

      {/* Search bar */}
      <div className="bg-white border-b border-border px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <SearchBar variant="compact" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">

          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="card p-5 sticky top-24">
              <h3 className="font-semibold text-ink-primary mb-4">Filters</h3>

              {/* Price range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-ink-primary mb-3">Price per night</h4>
                <div className="flex items-center justify-between text-sm text-ink-secondary mb-2">
                  <span>₦0</span>
                  <span>₦500,000+</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={500000}
                  step={5000}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                  className="w-full accent-brand"
                />
                <p className="text-xs text-ink-tertiary mt-1">Up to ₦{priceRange[1].toLocaleString()}</p>
              </div>

              {/* Star rating */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-ink-primary mb-3">Star rating</h4>
                {STAR_OPTIONS.map((s) => (
                  <label key={s} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStars.includes(s)}
                      onChange={() => toggleStar(s)}
                      className="accent-brand"
                    />
                    <span className="text-sm text-amber-400">{'★'.repeat(s)}</span>
                    <span className="text-sm text-ink-secondary">{s} stars</span>
                  </label>
                ))}
              </div>

              {/* Amenities */}
              <div>
                <h4 className="text-sm font-medium text-ink-primary mb-3">Amenities</h4>
                {AMENITY_OPTIONS.map((a) => (
                  <label key={a.key} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(a.key)}
                      onChange={() => toggleAmenity(a.key)}
                      className="accent-brand"
                    />
                    <span className="text-sm text-ink-secondary">{a.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4 gap-3">
              <div>
                <h1 className="font-semibold text-ink-primary">
                  {location ? `Hotels in ${location}` : 'All hotels'}
                </h1>
                <p className="text-sm text-ink-tertiary">{MOCK_HOTELS.length} properties found</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input pr-8 py-2 text-sm cursor-pointer"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                {/* View mode */}
                <div className="flex border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn('p-2', viewMode === 'grid' ? 'bg-brand text-white' : 'text-ink-secondary hover:bg-surface-secondary')}
                    aria-label="Grid view"
                  >
                    <Grid3X3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn('p-2', viewMode === 'list' ? 'bg-brand text-white' : 'text-ink-secondary hover:bg-surface-secondary')}
                    aria-label="List view"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Hotel grid/list */}
            <div className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                : 'flex flex-col gap-4'
            )}>
              {MOCK_HOTELS.map((hotel) => (
                <HotelCard key={hotel.id} hotel={hotel} variant={viewMode} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
