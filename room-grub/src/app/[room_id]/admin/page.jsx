import dynamic from 'next/dynamic';
import { LoginRequired } from '@/policies/LoginRequired';
import { validRoom } from '@/policies/validRoom';

// Lazy load heavy admin components
const AdminActions = dynamic(() => import('./_components/AdminActions'), {
  loading: () => <AdminLoadingSkeleton />
});

const AdminDashboard = dynamic(() => import('./_components/AdminDashboard'), {
  loading: () => null
});

function AdminLoadingSkeleton() {
  return (
    <div className="p-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="h-32 bg-gray-200 rounded mb-4"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
  );
}

export default async function AdminPage({ params }) {
  await LoginRequired();
  await validRoom({ params });

  return (
    <AdminActions>
      <AdminDashboard />
    </AdminActions>
  );
}