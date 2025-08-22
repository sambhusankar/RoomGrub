'use server'

import React from 'react';
import ListOptions from './_components/ListOptions';
import { LoginRequired } from '@/policies/LoginRequired';
import { validRoom } from '@/policies/validRoom';
import WelCome from './_components/WelCome';
import NotificationSubscriber from '@/component/NotificationSubscriber';

export default async function Page({ params }) {
  const session = await LoginRequired();
  await validRoom({ params });
  const { room_id } = await params;
  console.log('roomId', room_id);
  return (
    <>
      <WelCome />
      <ListOptions params={params} />
      <NotificationSubscriber roomId={room_id} userId={session.user.id} />
    </>
  );
}