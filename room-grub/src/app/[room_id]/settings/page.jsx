'use server'
import ActivityHistoryCard from './_components/ActivityHistoryCard'
import {LoginRequired} from '@/policies/LoginRequired'
import { validRoom } from '@/policies/validRoom';
import SettingsLayout from './_components/SettingsLayout';
import DangerZone from './_components/DangerZone';

export default async function page({params}){
  const userr = await LoginRequired();
  await validRoom({params});
  const p = await params;
  return(
    <SettingsLayout>
      <ActivityHistoryCard />
      <DangerZone roomId={p.room_id} />
    </SettingsLayout>
  )
}