'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { backendJson } from '@/utils/backend';

export async function getRoomMembersForRoom(roomId) {
    try {
        const session = await auth();
        const members = await backendJson(`/api/v1/rooms/${roomId}/members`);
        const currentUserEmail = session?.user?.email ?? null;
        const currentUser = (members || []).find(m => m.email === currentUserEmail) ?? null;
        return { members: members || [], currentUserEmail, currentUser };
    } catch {
        return { members: [], currentUserEmail: null, currentUser: null };
    }
}

export async function addExpense(roomId, description, amount, date, userEmail) {
    try {
        const session = await auth();
        if (!session) return { success: false, error: 'Unauthorized' };

        const body = {
            material: description,
            money: parseFloat(amount),
        };
        if (date) body.created_at = new Date(date).toISOString();

        await backendJson(`/api/v1/rooms/${roomId}/expenses`, {
            method: 'POST',
            body: JSON.stringify(body),
        });

        revalidatePath(`/${roomId}`, 'layout');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.detail };
    }
}

export async function addGroceryForFriend(roomId, friendEmail, grocery, price, date) {
    try {
        const session = await auth();
        if (!session) return { success: false, error: 'Unauthorized' };

        const body = {
            material: grocery.trim(),
            money: parseFloat(price),
            user_email: friendEmail,
        };
        if (date) body.created_at = new Date(date).toISOString();

        await backendJson(`/api/v1/rooms/${roomId}/expenses/for-member`, {
            method: 'POST',
            body: JSON.stringify(body),
        });

        revalidatePath(`/${roomId}`, 'layout');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.detail };
    }
}
