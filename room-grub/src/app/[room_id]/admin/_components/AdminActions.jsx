'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useUserRole from '@/hooks/useUserRole';

export default function AdminActions({ children }) {
    const params = useParams();
    const router = useRouter();
    const { role, loadings } = useUserRole();

    useEffect(() => {
        if (!loadings && role !== 'Admin') {
            router.push(`/${params.room_id}`);
        }
    }, [role, loadings, router, params.room_id]);

    // Show loading while checking role
    if (loadings) {
        return (
            <div style={{ 
                padding: '4rem', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '50vh' 
            }}>
                Loading admin dashboard...
            </div>
        );
    }

    // Don't render anything if user is not admin
    if (role !== 'Admin') {
        return null;
    }

    return children;
}