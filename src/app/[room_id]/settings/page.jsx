'use server'
import ActivityHistoryCard from './_components/ActivityHistoryCard'
import SettingsLayout from './_components/SettingsLayout';
import DangerZone from './_components/DangerZone';

export default async function page({params}){
  const p = await params;
  return(
    <SettingsLayout>
      <ActivityHistoryCard />
      <DangerZone roomId={p.room_id} />
    </SettingsLayout>
  )
}