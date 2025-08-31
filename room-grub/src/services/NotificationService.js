class NotificationService {
    // Main method to create notification and send push notifications via API
    async notify(roomId, triggeredBy, activityType, title, message, data = null) {
        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomId,
                    triggeredBy,
                    activityType,
                    title,
                    message,
                    data
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send notification');
            }

            const result = await response.json();
            console.log('Notification sent successfully:', result);
            return result.notification;
        } catch (error) {
            console.error('Error in notify method:', error);
            throw error;
        }
    }

    // Convenience methods for different notification types
    async notifyGroceryAdded(roomId, triggeredBy, userName, itemCount) {
        return this.notify(
            roomId,
            triggeredBy,
            'grocery',
            'New Grocery Items Added',
            `${userName} added ${itemCount} item(s) to the grocery list`,
            { itemCount }
        );
    }

    async notifyPaymentSettled(roomId, triggeredBy, userName, amount) {
        return this.notify(
            roomId,
            triggeredBy,
            'payment',
            'Payment Settled',
            `${userName} recorded a payment of ₹${amount}`,
            { amount }
        );
    }

    async notifyContributionMade(roomId, triggeredBy, userName, amount) {
        return this.notify(
            roomId,
            triggeredBy,
            'payment',
            'Contribution Made',
            `${userName} made a contribution of ₹${amount}`,
            { amount, type: 'contribution' }
        );
    }

    async notifyMemberJoined(roomId, triggeredBy, userName) {
        return this.notify(
            roomId,
            triggeredBy,
            'member_join',
            'New Member Joined',
            `${userName} joined the room`,
            { userName }
        );
    }

    async notifyExpenseAdded(roomId, triggeredBy, userName, amount, material) {
        return this.notify(
            roomId,
            triggeredBy,
            'expense',
            'New Expense Added',
            `${userName} added an expense: ${material} (₹${amount})`,
            { amount, material }
        );
    }
}

export default new NotificationService();