'use server'

import React from 'react';
import ListOptions from './_components/ListOptions';
import { LoginRequired } from '@/policies/LoginRequired';

export default async function Page({ params }) {
  const session = await LoginRequired();

  return <ListOptions params={params} />;
}