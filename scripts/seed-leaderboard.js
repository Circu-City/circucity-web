const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding leaderboard data...");

    // Mock Users
    const users = [
        { email: 'user1@test.com', id: 'usr_mock_1', name: 'Eco Champion', ecoPoints: 1540, totalCo2Saved: 125.5 },
        { email: 'user2@test.com', id: 'usr_mock_2', name: 'Green Thumb', ecoPoints: 1200, totalCo2Saved: 98.2 },
        { email: 'user3@test.com', id: 'usr_mock_3', name: 'Recycle Master', ecoPoints: 850, totalCo2Saved: 45.0 },
        { email: 'user4@test.com', id: 'usr_mock_4', name: 'Newbie Saver', ecoPoints: 120, totalCo2Saved: 5.5 },
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {
                name: user.name,
                ecoPoints: user.ecoPoints,
                totalCo2Saved: user.totalCo2Saved,
            },
            create: {
                id: user.id,
                email: user.email,
                name: user.name,
                ecoPoints: user.ecoPoints,
                totalCo2Saved: user.totalCo2Saved,
            },
        });
    }

    // To mock shops, we need them linked to users
    // Upserting owners first
    const owner1 = await prisma.user.upsert({
        where: { email: 'owner1@shop.com' },
        update: {},
        create: { id: 'own_mock_1', email: 'owner1@shop.com', name: 'Owner 1' }
    });
    const owner2 = await prisma.user.upsert({
        where: { email: 'owner2@shop.com' },
        update: {},
        create: { id: 'own_mock_2', email: 'owner2@shop.com', name: 'Owner 2' }
    });

    const shops = [
        { id: 'shp_mock_1', name: 'The Thrift Shop', ownerId: owner1.id, ecoPoints: 8500, totalCo2Saved: 1500.0, status: 'ACTIVE' },
        { id: 'shp_mock_2', name: 'Circular Electronics', ownerId: owner2.id, ecoPoints: 12000, totalCo2Saved: 3200.5, status: 'ACTIVE' },
    ];

    for (const shop of shops) {
        await prisma.shop.upsert({
            where: { id: shop.id },
            update: {
                ecoPoints: shop.ecoPoints,
                totalCo2Saved: shop.totalCo2Saved
            },
            create: shop
        })
    }

    console.log("Leaderboard data seeded!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
