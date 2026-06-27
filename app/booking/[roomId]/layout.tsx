
import { Suspense } from 'react'

export default function BookingLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-ink-tertiary text-sm">Loading booking...</div>
            </div>
        }>
            {children}
        </Suspense>
    )
}