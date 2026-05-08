import { auth } from '@/auth';
import { getMembers } from './actions';
import ListMembers from './_components/ListMembers';

export default async function MembersPage({ params }) {
    const session = await auth();
    const { room_id } = await params;
    const members = await getMembers(room_id);

    return (
        <ListMembers members={members} roomId={room_id} currentUserEmail={session.user.email} />
    );
}
