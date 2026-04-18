import MemberDetail from './_components/MemberDetail';
import { LoginRequired } from '@/policies/LoginRequired';
import { validRoom } from '@/policies/validRoom';

export default async function MemberDetailPage({ params }) {
    const user = await LoginRequired();
    await validRoom({ params });
    
    return <MemberDetail />;
}