# StayBook

A modern hotel booking platform that enables travelers to discover hotels, compare rooms, make reservations, and manage bookings through a seamless user experience.

## Tech Stack

| Layer      | Technology                |
|------------|---------------------------|
| Frontend   | Next.js 14, TypeScript, Tailwind CSS |
| State      | Zustand, Apollo Client    |
| Backend    | GraphQL (Node.js)         |
| Database   | PostgreSQL                |
| Auth       | JWT + bcrypt              |
| Forms      | React Hook Form + Zod     |
| Docker     | Docker Compose            |

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/hattrickz/staybook.git
cd staybook
npm install
```

### 2. Set up environment

```bash
cp docker/.env.example .env.local
# Edit .env.local with your values
```

### 3. Run with Docker (recommended)

```bash
docker-compose up --build
```

Access:
- Frontend: http://localhost:3000
- GraphQL Playground: http://localhost:4000/graphql

### 4. Run frontend only (dev)

```bash
npm run dev
```

## Project Structure

```
staybook/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Homepage
│   ├── hotels/             # Hotel listing page
│   ├── hotel/[id]/         # Hotel details page
│   ├── booking/            # Booking flow
│   ├── dashboard/          # Customer dashboard
│   └── auth/               # Login & register
│
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── hotel/              # HotelCard, RoomCard
│   ├── search/             # SearchBar
│   ├── booking/            # Booking form & confirmation
│   └── ui/                 # Button, Modal, Badge, etc.
│
├── graphql/
│   ├── queries/            # Apollo queries
│   └── mutations/          # Apollo mutations
│
├── hooks/                  # Custom React hooks
├── lib/
│   ├── apollo.ts           # Apollo client
│   ├── utils.ts            # Helpers (cn, formatPrice, etc.)
│   └── store/              # Zustand stores (auth, search)
├── types/                  # TypeScript types
└── docker/                 # Dockerfiles & env
```

## User Roles

- **Customer** — Search hotels, make bookings, manage reservations
- **Hotel Manager** — Add hotels/rooms, manage pricing, view reservations
- **Admin** — Full platform control, manage users and hotels

## Next Steps (Phase 2)

- [ ] GraphQL server implementation (Node.js + Apollo Server)
- [ ] PostgreSQL schema & migrations (Prisma)
- [ ] Hotel details page (`/hotel/[id]`)
- [ ] Booking flow (`/booking/[roomId]`)
- [ ] Hotel manager dashboard
- [ ] Image uploads (Cloudinary)
- [ ] Payment integration
- [ ] Review system
- [ ] Maps integration
