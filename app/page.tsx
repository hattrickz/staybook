'use client'

import { useQuery } from '@apollo/client'
import { GET_FEATURED_HOTELS } from '@/graphql/queries'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SearchBar } from '@/components/search/SearchBar'
import { HotelCard } from '@/components/hotel/HotelCard'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

const DESTINATIONS = [
  { name: 'Abuja', count: '48 hotels', emoji: '🏛️', color: 'from-emerald-500 to-teal-600' },
  { name: 'Lagos', count: '92 hotels', emoji: '🌊', color: 'from-blue-500 to-blue-700' },
  { name: 'Dubai', count: '134 hotels', emoji: '🏙️', color: 'from-amber-500 to-orange-600' },
  { name: 'London', count: '210 hotels', emoji: '🎡', color: 'from-purple-500 to-purple-700' },
  { name: 'Paris', count: '178 hotels', emoji: '🗼', color: 'from-pink-500 to-rose-600' },
  { name: 'New York', count: '256 hotels', emoji: '🗽', color: 'from-slate-500 to-slate-700' },
  { name: 'Tokyo', count: '189 hotels', emoji: '⛩️', color: 'from-red-500 to-red-700' },
]

const STATS = [
  { value: '12,500+', label: 'Hotels worldwide' },
  { value: '180+', label: 'Countries covered' },
  { value: '4.8★', label: 'Average rating' },
  { value: '2M+', label: 'Happy travelers' },
]

function HotelCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="w-full h-52 bg-surface-tertiary" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-surface-tertiary rounded w-3/4" />
        <div className="h-3 bg-surface-tertiary rounded w-1/2" />
        <div className="h-3 bg-surface-tertiary rounded w-1/3" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 w-12 bg-surface-tertiary rounded" />
          <div className="h-5 w-12 bg-surface-tertiary rounded" />
        </div>
        <div className="flex justify-between pt-3 border-t border-border">
          <div className="h-5 w-24 bg-surface-tertiary rounded" />
          <div className="h-5 w-20 bg-surface-tertiary rounded" />
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { data, loading, error } = useQuery(GET_FEATURED_HOTELS)
  const hotels = data?.featuredHotels ?? []

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <p className="text-sm font-medium text-brand uppercase tracking-widest mb-4">
          Your next getaway starts here
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-ink-primary leading-tight mb-4 max-w-3xl mx-auto">
          Find your perfect stay,{' '}
          <span className="text-brand">anywhere in the world</span>
        </h1>
        <p className="text-lg text-ink-secondary mb-10 max-w-xl mx-auto">
          Search thousands of hotels — from city escapes to beach resorts
        </p>
        <SearchBar variant="hero" className="max-w-4xl mx-auto" />
      </section>

      <section className="border-y border-border bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-semibold text-ink-primary">{s.value}</div>
                <div className="text-sm text-ink-tertiary mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Popular destinations</h2>
          <Link href="/hotels" className="flex items-center gap-1 text-sm text-brand hover:underline">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {DESTINATIONS.map((d) => (
            <Link
              key={d.name}
              href={`/hotels?location=${d.name}`}
              className="shrink-0 w-36 h-40 rounded-2xl overflow-hidden cursor-pointer"
            >
              <div className={`w-full h-full bg-gradient-to-br ${d.color} flex flex-col items-start justify-end p-4`}>
                <div className="text-2xl mb-1">{d.emoji}</div>
                <div className="text-white font-semibold text-base">{d.name}</div>
                <div className="text-white/70 text-xs">{d.count}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Featured hotels</h2>
          <Link href="/hotels" className="flex items-center gap-1 text-sm text-brand hover:underline">
            Browse all <ArrowRight size={14} />
          </Link>
        </div>

        {error && (
          <div className="text-center py-10 text-ink-tertiary text-sm">
            Could not load hotels. Make sure the GraphQL server is running.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <HotelCardSkeleton key={i} />)
            : hotels.map((hotel: any) => <HotelCard key={hotel.id} hotel={hotel} />)
          }
        </div>

        {!loading && !error && hotels.length === 0 && (
          <div className="text-center py-10 text-ink-tertiary text-sm">
            No featured hotels yet.
          </div>
        )}
      </section>

      <section className="bg-brand mx-4 sm:mx-6 lg:mx-8 mb-14 rounded-3xl">
        <div className="max-w-3xl mx-auto px-8 py-16 text-center">
          <h2 className="text-3xl font-semibold text-white mb-4">
            List your property on StayBook
          </h2>
          <p className="text-brand-100 mb-8 text-lg">
            Join thousands of hotel managers reaching millions of travelers worldwide.
          </p>
          <Link
            href="/auth/register?role=manager"
            className="inline-flex items-center gap-2 bg-white text-brand font-semibold px-8 py-3.5 rounded-xl hover:bg-brand-50 transition-colors"
          >
            Get started free <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
