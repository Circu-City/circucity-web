# Notification Feature Implementation

## Overview
A comprehensive notification system has been implemented to keep buyers and sellers informed about key events.

## Components

### 1. Database Schema
- **New Model**: `Notification`
  - Fields: `id`, `userId`, `title`, `message`, `type`, `isRead`, `link`, `createdAt`
  - Relation: Belongs to `User`
- **Enums**: `NotificationType` (INFO, SUCCESS, WARNING, ERROR, ORDER)

### 2. Backend Logic (`lib/notifications.ts`)
- `sendNotification`: Utility to create notifications in DB.
- `getNotifications`: Fetch recent notifications for a user.
- `markAsRead` / `markAllAsRead`: Status management.

### 3. API Endpoints (`app/api/notifications/route.ts`)
- `GET`: Fetches notifications and unread count for the authenticated user.
- `PATCH`: Marks individual or all notifications as read.

### 4. Frontend UI
- **NotificationBell**: A responsive bell icon with unread badge.
- **Dropdown**: Shows recent notifications with "Mark as Read" functionality.
- **Integration**: Added to `Header` component for authenticated users.

### 5. Automated Triggers
The following events now trigger notifications automatically:

- **Order Placed (Buyer)**: 
  - Trigger: Stripe Webhook (`checkout.session.completed`)
  - Message: "Order Confirmed: Your order #... has been placed successfully."
  - Type: SUCCESS

- **New Order (Seller)**:
  - Trigger: Stripe Webhook
  - Message: "New Order Received: You have received a new order for: [Product Names]"
  - Type: ORDER

- **Order Shipped (Buyer)**:
  - Trigger: Shipment Creation API (`POST /api/shipments`)
  - Message: "Order Shipped: Your order #... has been shipped! Tracking Number: ..."
  - Type: SUCCESS

## Usage
To send a notification from any server-side logic:

```typescript
import { sendNotification } from '@/lib/notifications';

await sendNotification(
    userId,
    'Title',
    'Message content',
    'INFO', // Type
    '/link/to/resource' // Optional link
);
```
