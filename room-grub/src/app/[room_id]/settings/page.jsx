'use server'
import ActivityHistoryCard from './_components/ActivityHistoryCard'
import {LoginRequired} from '@/policies/LoginRequired'
import { validRoom } from '@/policies/validRoom';
import SettingsLayout from './_components/SettingsLayout';

export default async function page({params}){
  const userr = await LoginRequired();
  await validRoom({params});
  return(
    <SettingsLayout>
      <ActivityHistoryCard />
    </SettingsLayout>
  )
}