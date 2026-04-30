'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import {
    HomeRounded,
    ReceiptLongRounded,
    AnalyticsRounded,
    GroupRounded,
    AddShoppingCartRounded,
} from '@mui/icons-material';

const tabs = [
    { label: 'Home', icon: HomeRounded, path: '' },
    { label: 'Expenses', icon: ReceiptLongRounded, path: '/expenses' },
    null, // FAB spacer
    { label: 'Splits', icon: AnalyticsRounded, path: '/splits' },
    { label: 'Friends', icon: GroupRounded, path: '/members' },
];

export default function BottomNav() {
    const { room_id } = useParams();
    const pathname = usePathname();
    const router = useRouter();

    if (!room_id) return null;

    const isActive = (path) => {
        const target = `/${room_id}${path}`;
        if (path === '') return pathname === `/${room_id}`;
        return pathname.startsWith(target);
    };

    return (
        <nav
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: 64,
                backgroundColor: '#ffffff',
                borderTop: '1px solid #e9d5ff',
                display: 'flex',
                alignItems: 'center',
                zIndex: 1000,
                paddingBottom: 'env(safe-area-inset-bottom)',
            }}
        >
            {tabs.map((tab, i) => {
                if (tab === null) {
                    // FAB spacer column
                    return (
                        <div key="fab" style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center' }}>
                            <button
                                onClick={() => router.push(`/${room_id}/addgroccery`)}
                                style={{
                                    position: 'absolute',
                                    bottom: 12,
                                    width: 56,
                                    height: 56,
                                    borderRadius: '50%',
                                    backgroundColor: '#9333ea',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(147, 51, 234, 0.4)',
                                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'scale(1.08)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(147, 51, 234, 0.5)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(147, 51, 234, 0.4)';
                                }}
                                aria-label="Add grocery"
                            >
                                <AddShoppingCartRounded style={{ color: '#ffffff', fontSize: 24 }} />
                            </button>
                        </div>
                    );
                }

                const { label, icon: Icon, path } = tab;
                const active = isActive(path);

                return (
                    <button
                        key={label}
                        onClick={() => router.push(`/${room_id}${path}`)}
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '6px 0',
                            color: active ? '#9333ea' : '#9ca3af',
                            transition: 'color 0.15s ease',
                        }}
                        aria-label={label}
                    >
                        <Icon style={{ fontSize: 22 }} />
                        <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: 0.2 }}>
                            {label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}
