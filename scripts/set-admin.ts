
import dotenv from 'dotenv';
import path from 'path';

// 1. Load environment variables FIRST
// We need to do this before importing lib/prisma because it expects process.env.DATABASE_URL to be set immediately
const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

console.log('Loading environment variables...');
dotenv.config({ path: envLocalPath });
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL is not defined in environment variables.');
    console.error('Make sure .env.local or .env exists and contains DATABASE_URL.');
    process.exit(1);
}

// 2. Dynamic import of prisma client
// This ensures that the module (and its top-level code) is evaluated ONLY AFTER env vars are loaded
async function main() {
    console.log('Importing Prisma client...');
    // Dynamic import to avoid hoisting issues
    const { default: prisma } = await import('../lib/prisma');

    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email address as an argument.');
        console.log('Usage: npx tsx scripts/set-admin.ts <email>');
        process.exit(1);
    }

    console.log(`Looking for user with email: ${email}...`);

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.error(`User with email "${email}" not found!`);
            // List a few users to help debug
            const count = await prisma.user.count();
            if (count > 0) {
                console.log(`(There are ${count} users in the database)`);
            }
            process.exit(1);
        }

        console.log(`Found user: ${user.name} (${user.id})`);
        console.log(`Current role: ${user.role}`);

        if (user.role === 'ADMIN') {
            console.log('User is already an ADMIN.');
            process.exit(0);
        }

        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });

        console.log(`✅ Successfully updated user role to ADMIN.`);
        console.log(`New role: ${updatedUser.role}`);

    } catch (error) {
        console.error('Error updating user role:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
