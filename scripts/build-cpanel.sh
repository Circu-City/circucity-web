#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Cleaning previous deployments and build cache..."
rm -rf .deploy deploy.zip deploy.tar.gz .next

echo "Building Next.js application (this may take a moment)..."
npm run build

echo "Preparing deployment artifacts..."
mkdir -p .deploy

# 1. Copy the standalone build output
cp -R .next/standalone/. .deploy/

# 2. Copy the static assets
echo "Copying static assets..."
mkdir -p .deploy/.next/static
cp -R .next/static/. .deploy/.next/static/

# 3. Copy the public directory
echo "Copying public folder..."
cp -R public .deploy/

# 4. Cleanup Prisma (Next.js automatically embeds it in .deploy/node_modules)
echo "Packaging Prisma for cPanel..."

# Remove standalone binary engines from Prisma cache to save space (we only need the .so.node library for production)
find .deploy/node_modules/.prisma -type f -not -name "*.so.node" -not -name "package.json" -not -name "schema.prisma" -not -name "*.js" -not -name "*.d.ts" -delete || true

# 5. Create a custom cPanel logger wrapper
echo "Creating cPanel server wrapper..."
cat << 'EOF' > .deploy/cpanel-server.js
const fs = require('fs');
const path = require('path');

const errStream = fs.createWriteStream(path.join(__dirname, 'stderr.log'), { flags: 'a' });
const outStream = fs.createWriteStream(path.join(__dirname, 'stdout.log'), { flags: 'a' });

process.stdout.write = outStream.write.bind(outStream);
process.stderr.write = errStream.write.bind(errStream);

// Force load the .env file if it exists
try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        console.log('Found .env file, loading variables into memory...');
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
                const separatorIndex = trimmedLine.indexOf('=');
                const key = trimmedLine.substring(0, separatorIndex).trim();
                let value = trimmedLine.substring(separatorIndex + 1).trim();
                
                // Remove wrapping quotes if they exist
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                } else if (value.startsWith("'") && value.endsWith("'")) {
                    value = value.substring(1, value.length - 1);
                }
                process.env[key] = value;
            }
        });
    }
} catch (e) {
    console.error('Failed to parse .env file:', e);
}

process.on('uncaughtException', (err) => {
    errStream.write(`[${new Date().toISOString()}] Uncaught Exception: ${err.stack}\n`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    errStream.write(`[${new Date().toISOString()}] Unhandled Rejection: ${reason}\n`);
});

// Boot Next.js standalone server
require('./server.js');
EOF

echo "Creating deploy.tar.gz archive..."
cd .deploy
# COPYFILE_DISABLE=1 and macOS tar flags prevent adding '._' metadata and PAX extended headers
env COPYFILE_DISABLE=1 tar --no-xattr --no-mac-metadata --no-fflags -czf ../deploy.tar.gz .
cd ..

echo ""
echo "✅ Build complete!"
echo "The ZIP format was blocked by cPanel, so we used tar.gz to bypass the false positive."
echo "You can now upload 'deploy.tar.gz' to cPanel (e.g., File Manager -> circucity_web) and extract it."
