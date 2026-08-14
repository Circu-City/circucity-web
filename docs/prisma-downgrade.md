# Prisma Downgrade Documentation (v7 -> v5.22.0)

## Context
During the migration to MySQL, we initially upgraded to Prisma 7. However, we encountered environment-specific limitations that made Prisma 7 incompatible with our current setup.

### The Issue
Prisma 7 deprecated the `url` property in the `datasource` block of `schema.prisma`. It now requires:
1.  Using a `prisma.config.ts` file for configuration.
2.  Using a "Driver Adapter" (e.g., `@prisma/adapter-mysql`) for database connections.

Attempting to install `@prisma/adapter-mysql` failed due to NPM authentication issues (`404 Not Found` / `Access token expired`). Without the adapter, Prisma 7 could not be configured correctly in this environment.

## Resolution: Downgrade to Prisma 5.22.0
We downgraded the Prisma CLI and Client to version **5.22.0**, which supports the standard configuration method without requiring separate driver adapters.

### Changes Made

#### 1. Dependencies (`package.json`)
- **Changed**: `prisma` (Dev Dep) -> `5.22.0`
- **Changed**: `@prisma/client` (Dep) -> `5.22.0`

#### 2. Schema Configuration (`prisma/schema.prisma`)
Restored the `url` property to the `datasource` block, which is the standard configuration for Prisma 5.

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL") // Restored this line
}
```

#### 3. Client Initialization (`lib/prisma.ts`)
Reverted to the standard, simple initialization method.

**Before (Attempted v7 workaround):**
```typescript
const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL, // Manual override
});
```

**After (v5 Standard):**
```typescript
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});
```
*Note: Same change applied to `prisma/seed.ts`.*

#### 4. Cleanup
- **Deleted**: `prisma.config.ts` (Not supported/needed in v5).

## Verification
To ensure the application runs correctly:

1.  **Re-generate Client**:
    ```bash
    npx prisma generate
    ```
    *Output should show: `Generated Prisma Client (v5.22.0)`*

2.  **Start Server**:
    ```bash
    npm run dev
    ```
    The application should start without `PrismaClientConstructorValidationError`.
