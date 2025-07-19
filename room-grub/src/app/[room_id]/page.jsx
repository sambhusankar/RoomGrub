'use server'

import React from 'react';
import ListOptions from './_components/ListOptions';
import { LoginRequired } from '@/policies/LoginRequired';
import WelCome from './_components/WelCome';

export default async function Page({ params }) {
  const session = await LoginRequired();

  return (
    <>
      <WelCome />
      <ListOptions params={params} />
    </>
  );
}