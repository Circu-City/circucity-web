# Next.js 15 Breaking Change - Params as Promise

## Issue

When building for production, you may encounter this error:

```
Type error: Type 'typeof import("...")' does not satisfy the constraint 'RouteHandlerConfig<"...">'.
  Types of property 'POST' are incompatible.
    Property 'orderId' is missing in type 'Promise<{ orderId: string; }>' but required in type '{ orderId: string; }'.
```

## Cause

In **Next.js 15**, route parameters (`params`) are now **Promises** that must be awaited.

## Solution

### ❌ Old Way (Next.js 14 and earlier)

```typescript
export async function POST(
    req: Request,
    { params }: { params: { orderId: string } }
) {
    const { orderId } = params; // Direct access
    // ...
}
```

### ✅ New Way (Next.js 15)

```typescript
export async function POST(
    req: Request,
    { params }: { params: Promise<{ orderId: string }> }
) {
    const { orderId } = await params; // Must await!
    // ...
}
```

## Files Updated

- ✅ `/app/api/orders/[orderId]/cancel/route.ts` - Fixed

## Why This Change?

Next.js 15 made this change to:
1. Support async parameter resolution
2. Enable better streaming and performance
3. Prepare for future React Server Components features

## Other Routes to Check

If you have other dynamic routes, update them similarly:

```typescript
// Any route with [param] in the path
app/api/products/[productId]/route.ts
app/api/users/[userId]/route.ts
app/api/shops/[shopId]/route.ts
```

All need the same fix:
1. Change `params: { ... }` to `params: Promise<{ ... }>`
2. Add `await` when accessing params

## Reference

- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-15)
- [Route Handler API Reference](https://nextjs.org/docs/app/api-reference/file-conventions/route)
