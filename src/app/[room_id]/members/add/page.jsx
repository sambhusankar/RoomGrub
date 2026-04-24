import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getPendingInvites } from '@/app/invite/actions';
import InvitePanel from '../_components/InvitePanel';

export default async function InvitePage({ params }) {
  const { room_id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: currentUser } = await supabase
    .from('Users')
    .select('role, room')
    .eq('uid', user.id)
    .single();

  if (!currentUser || currentUser.room !== parseInt(room_id)) {
    redirect(`/${room_id}/members`);
  }

  if (currentUser.role !== 'Admin') {
    redirect(`/${room_id}/members`);
  }

  const { invites } = await getPendingInvites(room_id);

  return <InvitePanel roomId={room_id} initialInvites={invites || []} />;
}
