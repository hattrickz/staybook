import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create manager
    const manager = await prisma.user.upsert({
        where: { email: 'manager@staybook.com' },
        update: {},
        create: {
            name: 'Hotel Manager',
            email: 'manager@staybook.com',
            password: await bcrypt.hash('password123', 12),
            role: 'manager',
        },
    })

    // Create customer
    await prisma.user.upsert({
        where: { email: 'customer@staybook.com' },
        update: {},
        create: {
            name: 'Test Customer',
            email: 'customer@staybook.com',
            password: await bcrypt.hash('password123', 12),
            role: 'customer',
        },
    })

    // Create hotel
    const hotel = await prisma.hotel.upsert({
        where: { id: 'hotel-eko-001' },
        update: {},
        create: {
            id: 'hotel-eko-001',
            name: 'Eko Hotel & Suites',
            description: 'Lagos premier luxury destination on Victoria Island.',
            location: 'Plot 1415 Adetokunbo Ademola Street, Victoria Island, Lagos',
            city: 'Lagos',
            country: 'Nigeria',
            rating: 4.6,
            reviewCount: 892,
            images: [],
            amenities: [
                { key: 'pool', label: 'Swimming Pool', icon: 'Waves' },
                { key: 'wifi', label: 'Free WiFi', icon: 'Wifi' },
                { key: 'spa', label: 'Spa', icon: 'Sparkles' },
                { key: 'restaurant', label: 'Restaurant', icon: 'UtensilsCrossed' },
            ],
            priceFrom: 65000,
            currency: 'NGN',
            featured: true,
            managerId: manager.id,
        },
    })

    // Create rooms
    await prisma.room.createMany({
        skipDuplicates: true,
        data: [
            {
                hotelId: hotel.id, name: 'Standard Queen Room',
                roomType: 'standard', bedType: 'queen',
                price: 65000, currency: 'NGN', capacity: 2, size: 32,
                images: [], amenities: ['Free WiFi', 'Air conditioning', 'TV'],
                description: 'Comfortable room with queen bed.',
                refundable: true, breakfastIncluded: false,
            },
            {
                hotelId: hotel.id, name: 'Deluxe King Room',
                roomType: 'deluxe', bedType: 'king',
                price: 95000, currency: 'NGN', capacity: 2, size: 45,
                images: [], amenities: ['Free WiFi', 'Mini bar', 'Ocean view'],
                description: 'Spacious room with king bed and ocean view.',
                refundable: true, breakfastIncluded: true,
            },
            {
                hotelId: hotel.id, name: 'Executive Suite',
                roomType: 'suite', bedType: 'king',
                price: 180000, currency: 'NGN', capacity: 3, size: 75,
                images: [], amenities: ['Free WiFi', 'Jacuzzi', 'Butler service'],
                description: 'Stunning suite with Jacuzzi and panoramic views.',
                refundable: false, breakfastIncluded: true,
            },
        ],
    })

    console.log('✅ Seed complete!')
    console.log('   manager@staybook.com / password123')
    console.log('   customer@staybook.com / password123')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())