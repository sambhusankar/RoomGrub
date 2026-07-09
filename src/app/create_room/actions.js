'use server';

import { redirect } from 'next/navigation';
import { LoginRequired } from '@/policies/LoginRequired';
import { backendJson } from '@/utils/backend';

export const createRoom = async () => {
    await LoginRequired();

    const newRoom = await backendJson('/api/v1/rooms', {
        method: 'POST',
        body: JSON.stringify({}),
    });

    if (!newRoom?.id) {
        console.error('Room creation returned no id');
        return;
    }

    redirect(`/${newRoom.id}`);
};
