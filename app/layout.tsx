import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: {
    default: 'StayBook — Find Your Perfect Stay',
    template: '%s | StayBook',
  },
  description:
    'Search and book hotels worldwide. Compare prices, amenities, and reviews to find your perfect stay.',
  keywords: ['hotels', 'booking', 'travel', 'accommodation', 'StayBook'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://staybook.com',
    siteName: 'StayBook',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
