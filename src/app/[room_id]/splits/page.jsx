import dynamic from 'next/dynamic';
import { auth, getUserRoomForRoom } from '@/auth';
import { getSplitsData } from './actions';

const SplitsDashboard = dynamic(() => import('./_components/SplitsDashboard'));

export default async function SplitsPage({ params }) {
    const session = await auth();
    const { room_id } = await params;
    const { data: membership } = await getUserRoomForRoom(session.user.email, room_id);
    const { expenses, payments, members } = await getSplitsData(room_id);

    return (
        <SplitsDashboard
            expenses={expenses}
            payments={payments}
            members={members}
            roomId={room_id}
            userRole={membership?.role ?? null}
        />
    );
}
