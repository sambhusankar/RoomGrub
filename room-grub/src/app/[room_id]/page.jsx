'use server'

import React from 'react';
import ListOptions from './_components/ListOptions';
import { LoginRequired } from '@/policies/LoginRequired';
import { validRoom } from '@/policies/validRoom';
import WelCome from './_components/WelCome';
import NotificationPrompt from '@/components/NotificationPrompt';

export default async function Page({ params }) {
  const session = await LoginRequired();
  await validRoom({ params });

  return (
    <>
      <WelCome />
      <NotificationPrompt />
      <ListOptions params={params} />
    </>
  );
}