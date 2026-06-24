import Link from 'next/link'

const FOOTER_LINKS = {
  Company: ['About', 'Careers', 'Press', 'Blog'],
  Support: ['Help Center', 'Contact', 'Privacy Policy', 'Terms'],
  Destinations: ['Abuja', 'Lagos', 'Dubai', 'London', 'Paris'],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-secondary mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-ink-primary mb-3">
              <span className="w-2 h-2 rounded-full bg-brand inline-block" />
              StayBook
            </Link>
            <p className="text-sm text-ink-tertiary leading-relaxed">
              Find and book the perfect hotel for any trip — from city breaks to beach escapes.
            </p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold text-ink-primary uppercase tracking-wider mb-3">{title}</h4>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-sm text-ink-tertiary hover:text-ink-secondary transition-colors">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ink-tertiary">© 2025 StayBook. All rights reserved.</p>
          <p className="text-xs text-ink-tertiary">Made with ♡ for travelers everywhere</p>
        </div>
      </div>
    </footer>
  )
}
