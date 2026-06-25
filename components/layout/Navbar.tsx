'use client'
import type { Route } from 'next'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store/auth'

const NAV_LINKS = [
  { label: 'Hotels', href: '/hotels' },
  { label: 'Offers', href: '/offers' },
  { label: 'Blog', href: '/blog' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    setMenuOpen(false)
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-base md:text-lg text-ink-primary shrink-0"
          >
            <span className="w-2 h-2 rounded-full bg-brand inline-block" />
            StayBook
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href as Route}
                className={cn(
                  'text-sm transition-colors',
                  pathname === link.href
                    ? 'text-brand font-medium'
                    : 'text-ink-secondary hover:text-ink-primary'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-sm text-ink-secondary hover:text-ink-primary transition-colors px-3 py-2 rounded-lg hover:bg-surface-secondary"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-50 flex items-center justify-center">
                    <User size={14} className="text-brand" />
                  </div>
                  {user.name.split(' ')[0]}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-border rounded-xl shadow-elevated py-1 z-50">
                    <Link
                      href={user.role === 'manager' ? '/dashboard/manager' : '/dashboard'}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-ink-secondary hover:bg-surface-secondary"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard size={15} />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost">Log in</Link>
                <Link href="/auth/register" className="btn-primary">Sign up</Link>
              </>
            )}
          </div>

          {/* Mobile right side */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && user && (
              <Link
                href={user.role === 'manager' ? '/dashboard/manager' : '/dashboard'}
                className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center"
              >
                <User size={15} className="text-brand" />
              </Link>
            )}
            <button
              className="p-2 rounded-lg hover:bg-surface-secondary"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href as Route}
              className="block py-2.5 px-3 rounded-lg text-sm text-ink-secondary hover:bg-surface-secondary hover:text-ink-primary"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-border mt-2 space-y-2">
            {isAuthenticated && user ? (
              <>
                <div className="px-3 py-2">
                  <p className="font-medium text-ink-primary text-sm">{user.name}</p>
                  <p className="text-xs text-ink-tertiary">{user.email}</p>
                </div>
                <Link
                  href={user.role === 'manager' ? '/dashboard/manager' : '/dashboard'}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-ink-secondary hover:bg-surface-secondary"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  href="/auth/login"
                  className="btn-outline text-center py-2.5"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary text-center py-2.5"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}