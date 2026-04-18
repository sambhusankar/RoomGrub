# Push Notifications Setup Guide

This guide will help you set up push notifications for your RoomGrub application.

## Overview

The push notification system allows users to receive real-time notifications when:
- Someone adds grocery items
- Payments are settled
- Contributions are made
- New members join the room
- Expenses are added

## Prerequisites

1. HTTPS connection (required for push notifications)
2. A modern browser that supports push notifications
3. VAPID keys for server-to-browser communication

## Setup Steps

### 1. Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for push notifications. You can generate them at [https://vapidkeys.com/](https://vapidkeys.com/) or use the web-push CLI:

```bash
npx web-push generate-vapid-keys
```

This will generate a key pair like:
```
Public Key: BEl...xyz
Private Key: abc...123
```

### 2. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# VAPID Keys for Push Notifications
VAPID_SUBJECT=mailto:your-email@example.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BEl...xyz
VAPID_PRIVATE_KEY=abc...123
```

**Important:**
- Replace `your-email@example.com` with your actual email
- Replace the keys with your generated VAPID keys
- The public key is prefixed with `NEXT_PUBLIC_` to make it available on the client side
- Keep the private key secret and never expose it in client-side code

### 3. Database Tables

The following tables are required for push notifications (should already exist):

#### notifications table
```sql
create table public.notifications (
  id serial not null,
  room_id integer not null,
  triggered_by integer null,
  activity_type character varying(50) not null,
  title character varying(255) not null,
  message text not null,
  data jsonb null,
  created_at timestamp with time zone null default now(),
  constraint notifications_pkey primary key (id),
  constraint fk_notifications_room foreign KEY (room_id) references "Rooms" (id) on delete CASCADE,
  constraint fk_notifications_user foreign KEY (triggered_by) references "Users" (id) on delete set null,
  constraint check_activity_type check (
    (activity_type)::text = any (
      array['payment', 'grocery', 'expense', 'member_join', 'member_leave']::text[]
    )
  )
);
```

#### push_subscriptions table
```sql
create table public.push_subscriptions (
  id serial not null,
  user_id integer not null,
  room_id integer not null,
  endpoint text not null,
  p256dh_key text not null,
  auth_key text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint push_subscriptions_pkey primary key (id),
  constraint unique_user_room_subscription unique (user_id, room_id),
  constraint fk_push_subscriptions_room foreign KEY (room_id) references "Rooms" (id) on delete CASCADE,
  constraint fk_push_subscriptions_user foreign KEY (user_id) references "Users" (id) on delete CASCADE
);
```

### 4. Service Worker Registration

The application includes a push notification service worker at `/public/push-sw.js`. Make sure your site is served over HTTPS for service workers to function properly.

### 5. Icon Setup

Ensure you have notification icons in your `/public` directory:
- `/public/icons/logo-192.png` - Main notification icon
- `/public/icons/logo-72.png` - Badge icon
- `/public/icons/logo-48.png` - Action icon

## Usage

### For Users

1. **Enable Notifications**: Visit any room and use the notification settings component to enable push notifications
2. **Grant Permission**: The browser will ask for notification permission - click "Allow"
3. **Receive Notifications**: You'll now receive push notifications for room activities even when the app is closed

### For Developers

The notification system is automatically integrated into:

- **Grocery Addition**: `src/app/[room_id]/addgroccery/_components/AddGroccery.jsx`
- **Payment Settlement**: `src/app/[room_id]/payments/pay/_components/PaymentForm.jsx`  
- **Contributions**: `src/app/[room_id]/members/[member_id]/_components/ContributionModal.jsx`
- **Member Addition**: `src/app/[room_id]/members/add/page.jsx`

To add notifications to new features:

```javascript
import NotificationService from '@/services/NotificationService';

// Send a custom notification
await NotificationService.notify(
  roomId,           // Room ID
  userId,           // User who triggered the action
  'activity_type',  // Type of activity
  'Title',          // Notification title
  'Message body',   // Notification message
  { extra: 'data' } // Optional additional data
);
```

## Troubleshooting

### Notifications Not Working

1. **Check HTTPS**: Push notifications require HTTPS (except for localhost)
2. **Check Permissions**: Ensure notifications are allowed in browser settings
3. **Check VAPID Keys**: Verify environment variables are set correctly
4. **Check Browser Support**: Use a modern browser that supports push notifications
5. **Check Console**: Look for errors in browser console and server logs

### Testing Notifications

1. Open your app in multiple browser tabs/windows
2. Perform an action (add grocery, make payment, etc.) in one tab
3. You should see a notification in other tabs/windows

### Browser Compatibility

Push notifications are supported in:
- Chrome 42+
- Firefox 44+
- Safari 16+ (on macOS 13+)
- Edge 17+

## Security Notes

1. **VAPID Private Key**: Never expose your VAPID private key in client-side code
2. **HTTPS Required**: Push notifications only work over HTTPS in production
3. **User Consent**: Always request user permission before subscribing to notifications
4. **Data Privacy**: Notification data is stored temporarily for delivery - ensure compliance with privacy regulations

## API Endpoints

The notification system doesn't require additional API endpoints as it uses Supabase directly. However, if you want to create REST endpoints, you can create API routes that use the `NotificationService`.

## Customization

You can customize notifications by:

1. **Modifying Messages**: Edit the notification messages in `NotificationService.js`
2. **Adding New Types**: Add new activity types to the database constraint and notification service
3. **Custom Icons**: Replace the notification icons in `/public/icons/`
4. **Custom Actions**: Modify the service worker to add custom notification actions

## Performance Considerations

1. **Batch Notifications**: The service automatically batches notifications to room members
2. **Invalid Subscriptions**: The system automatically removes invalid/expired push subscriptions
3. **Rate Limiting**: Consider implementing rate limiting for notification-heavy operations

## Support

For issues with push notifications:
1. Check the browser console for errors
2. Verify VAPID key configuration
3. Ensure HTTPS is enabled in production
4. Test with different browsers and devices