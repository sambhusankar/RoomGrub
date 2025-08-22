import AdminActions from './_components/AdminActions';
import AdminDashboard from './_components/AdminDashboard';
import { LoginRequired } from '@/policies/LoginRequired';
import { validRoom } from '@/policies/validRoom';

export default async function AdminPage({params}) {
    const user = await LoginRequired();
    await validRoom({params});
    return (
        <AdminActions>
            <AdminDashboard />
        </AdminActions>
    );
}