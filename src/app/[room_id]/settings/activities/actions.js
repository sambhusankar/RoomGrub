'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { backendJson } from '@/utils/backend';

export async function getActivitiesData(roomId) {
    try {
        const session = await auth();
        if (!session) return { activities: [], isAdmin: false, emailToName: {} };

        const [expensesData, membersData] = await Promise.all([
            backendJson(`/api/v1/rooms/${roomId}/expenses?settled=false&limit=100`),
            backendJson(`/api/v1/rooms/${roomId}/members`),
        ]);

        const members = membersData || [];
        const isAdmin = members.find(m => m.email === session.user.email)?.role === 'Admin';

        const emailToName = {};
        members.forEach(m => { if (m.email) emailToName[m.email] = m.name || m.email; });

        const activities = (expensesData?.items || []).map(e => ({
            id: e.id,
            type: 'grocery',
            user: emailToName[e.user] || e.user,
            userEmail: e.user,
            amount: e.money,
            description: e.material,
            createdAt: e.created_at,
        }));

        return { activities, isAdmin, emailToName };
    } catch {
        return { activities: [], isAdmin: false, emailToName: {} };
    }
}

export async function editGroceryActivity(activityId, formData, roomId) {
    try {
        const material = formData.get('material');
        const money = parseFloat(formData.get('money'));
        const created_at = formData.get('created_at');

        await backendJson(`/api/v1/rooms/${roomId}/expenses/${activityId}`, {
            method: 'PATCH',
            body: JSON.stringify({ material, money, created_at }),
        });

        revalidatePath(`/${roomId}`, 'layout');
        return { success: true };
    } catch (error) {
        return { error: error.detail || 'Failed to update expense' };
    }
}

export async function deleteGroceryActivity(activityId, material, money, roomId) {
    try {
        await backendJson(`/api/v1/rooms/${roomId}/expenses/${activityId}`, { method: 'DELETE' });

        revalidatePath(`/${roomId}`, 'layout');
        return { success: true };
    } catch (error) {
        return { error: error.detail || 'Failed to delete expense' };
    }
}
