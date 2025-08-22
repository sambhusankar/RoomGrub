import webpush from 'web-push';
import db from '@/database';

// Configure VAPID details
webpush.setVapidDetails(
  'mailto:your-email@domain.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export class NotificationService {
  static async sendNotification(roomId, triggeredBy, activityType, title, message, data = {}) {
    try {
      // Create notification record
      const notification = await db.Notification.create({
        room_id: roomId,
        triggered_by: triggeredBy,
        activity_type: activityType,
        title,
        message,
        data
      });

      // Get all push subscriptions for the room except the user who triggered it
      const subscriptions = await db.PushSubscription.findAll({
        where: {
          room_id: roomId,
          user_id: {
            [db.Sequelize.Op.ne]: triggeredBy // Exclude the user who triggered the action
          }
        },
        include: [{
          model: db.User,
          as: 'user',
          attributes: ['name', 'email']
        }]
      });

      // Send push notifications to all subscribed users
      const pushPromises = subscriptions.map(async (subscription) => {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key
          }
        };

        const payload = JSON.stringify({
          title,
          body: message,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          data: {
            ...data,
            roomId,
            notificationId: notification.id,
            url: `/${roomId}`
          }
        });

        try {
          await webpush.sendNotification(pushSubscription, payload);
          console.log(`Notification sent to user: ${subscription.user.name}`);
        } catch (error) {
          console.error(`Failed to send notification to ${subscription.user.name}:`, error);
          
          // If subscription is invalid (410 Gone), remove it
          if (error.statusCode === 410) {
            await subscription.destroy();
            console.log(`Removed invalid subscription for user: ${subscription.user.name}`);
          }
        }
      });

      await Promise.all(pushPromises);
      
      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  static async sendPaymentNotification(roomId, payerId, payerName, amount, receiverName) {
    const title = '💰 Payment Made';
    const message = `${payerName} paid ₹${amount} to ${receiverName}`;
    
    return this.sendNotification(
      roomId,
      payerId,
      'payment',
      title,
      message,
      {
        amount,
        payerName,
        receiverName,
        type: 'payment'
      }
    );
  }

  static async sendGroceryNotification(roomId, userId, userName, itemName, amount) {
    const title = '🛒 New Grocery Added';
    const message = `${userName} added ${itemName} for ₹${amount}`;
    
    return this.sendNotification(
      roomId,
      userId,
      'grocery',
      title,
      message,
      {
        amount,
        itemName,
        userName,
        type: 'grocery'
      }
    );
  }

  static async sendExpenseNotification(roomId, userId, userName, description, amount) {
    const title = '💸 New Expense';
    const message = `${userName} added expense: ${description} - ₹${amount}`;
    
    return this.sendNotification(
      roomId,
      userId,
      'expense',
      title,
      message,
      {
        amount,
        description,
        userName,
        type: 'expense'
      }
    );
  }

  static async sendMemberJoinNotification(roomId, newUserId, newUserName) {
    const title = '👋 New Member';
    const message = `${newUserName} joined the room`;
    
    return this.sendNotification(
      roomId,
      newUserId,
      'member_join',
      title,
      message,
      {
        newUserName,
        type: 'member_join'
      }
    );
  }

  // Get notification history for a room
  static async getNotificationHistory(roomId, limit = 50) {
    return await db.Notification.findAll({
      where: { room_id: roomId },
      include: [{
        model: db.User,
        as: 'triggeredBy',
        attributes: ['name', 'email', 'profile']
      }],
      order: [['created_at', 'DESC']],
      limit
    });
  }

  // Mark notifications as read (if you want to implement read status later)
  static async markAsRead(notificationIds) {
    // Implementation for read status if needed
    // Would require adding read_status table or field
  }
}