'use server';

import { createClient } from '@/utils/supabase/server';
import { auth, getUserRoom } from '@/auth';

export async function fetchHomeSummary(roomId) {
    try {
        const session = await auth();
        if (!session) {
            return { totalPurchases: 0, pendingAmount: 0, recentExpenses: [] };
        }

        const { data: userRoom, error: roomError } = await getUserRoom(session.user.email);
        if (roomError || !userRoom || userRoom.room != roomId) {
            return { totalPurchases: 0, pendingAmount: 0, recentExpenses: [] };
        }

        const supabase = await createClient();

        // Total purchases for current user in this room (unsettled only)
        const { data: spendingsData } = await supabase
            .from('Spendings')
            .select('money')
            .eq('user', session.user.email)
            .eq('room', roomId)
            .or('settled.is.null,settled.eq.false');

        const totalPurchases = (spendingsData || []).reduce(
            (sum, s) => sum + parseFloat(s.money || 0),
            0
        );

        // Legacy lump-sum debit records only (spending_id IS NULL)
        // Per-expense debits (spending_id IS NOT NULL) are already handled by filtering settled spendings out above
        const { data: balanceData } = await supabase
            .from('balance')
            .select('amount')
            .eq('user', session.user.email)
            .eq('room', roomId)
            .eq('status', 'debit')
            .is('spending_id', null);

        const totalReceived = (balanceData || []).reduce(
            (sum, b) => sum + parseFloat(b.amount || 0),
            0
        );

        const pendingAmount = Math.max(0, totalPurchases + totalReceived);

        // Recent 5 expenses for the whole room (all members)
        const { data: recentData } = await supabase
            .from('Spendings')
            .select('*')
            .eq('room', roomId)
            .order('created_at', { ascending: false })
            .limit(5);

        const recentExpenses = recentData || [];

        // Enrich with user data
        const uniqueEmails = [...new Set(recentExpenses.map(e => e.user))].filter(Boolean);
        let userMap = new Map();

        if (uniqueEmails.length > 0) {
            const { data: usersData } = await supabase
                .from('Users')
                .select('email, name, profile')
                .in('email', uniqueEmails);

            userMap = new Map((usersData || []).map(u => [u.email, u]));
        }

        // Enrich settled expenses with settlement date
        const settledIds = recentExpenses.filter(e => e.settled).map(e => e.id);
        let settlementDateMap = new Map();

        if (settledIds.length > 0) {
            const { data: settlementData } = await supabase
                .from('balance')
                .select('spending_id, created_at')
                .in('spending_id', settledIds)
                .eq('status', 'debit');

            (settlementData || []).forEach(r => {
                if (!settlementDateMap.has(r.spending_id)) {
                    settlementDateMap.set(r.spending_id, r.created_at);
                }
            });
        }

        const enrichedExpenses = recentExpenses.map(e => ({
            ...e,
            Users: userMap.get(e.user),
            settledAt: settlementDateMap.get(e.id) || null,
        }));

        return { totalPurchases, pendingAmount, recentExpenses: enrichedExpenses };
    } catch (error) {
        console.error('Error fetching home summary:', error);
        return { totalPurchases: 0, pendingAmount: 0, recentExpenses: [] };
    }
}

export async function fetchRoomDashboard(roomId) {
    try {
        const session = await auth();
        if (!session) return { totalRoomStats: null, memberStats: [] };

        const { data: userRoom, error: roomError } = await getUserRoom(session.user.email);
        if (roomError || !userRoom || userRoom.room != roomId) {
            return { totalRoomStats: null, memberStats: [] };
        }

        const supabase = await createClient();

        const { data: membersData, error: membersError } = await supabase
            .from('Users')
            .select('*')
            .eq('room', roomId);

        if (membersError) throw membersError;

        const [purchasesResult, paymentsResult] = await Promise.all([
            supabase.from('Spendings').select('*').eq('room', roomId).or('settled.is.null,settled.eq.false'),
            supabase.from('balance').select('*').eq('room', roomId).is('spending_id', null),
        ]);

        const allPurchases = purchasesResult.data || [];
        const allPayments = paymentsResult.data || [];

        const purchasesByUser = new Map();
        const paymentsByUser = new Map();

        allPurchases.forEach(purchase => {
            if (!purchasesByUser.has(purchase.user)) purchasesByUser.set(purchase.user, []);
            purchasesByUser.get(purchase.user).push(purchase);
        });

        allPayments.forEach(payment => {
            if (!paymentsByUser.has(payment.user)) paymentsByUser.set(payment.user, []);
            paymentsByUser.get(payment.user).push(payment);
        });

        const memberStats = (membersData || []).map((member) => {
            const purchases = purchasesByUser.get(member.email) || [];
            const payments = paymentsByUser.get(member.email) || [];

            const totalPurchases = purchases.reduce((sum, p) => sum + parseFloat(p.money), 0);
            const totalReceived = payments
                .filter(p => p.status === 'debit')
                .reduce((sum, p) => sum + parseFloat(p.amount), 0);
            const pendingAmount = Math.max(0, totalPurchases + totalReceived);

            return {
                member,
                pendingAmount,
                status: pendingAmount > 0 ? 'pending' : 'settled',
            };
        });

        const totalRoomStats = memberStats.reduce((acc, stat) => ({
            totalPurchases: acc.totalPurchases + stat.pendingAmount,
            pendingPayments: acc.pendingPayments + stat.pendingAmount,
        }), { totalPurchases: 0, pendingPayments: 0 });

        return { totalRoomStats, memberStats };
    } catch (error) {
        console.error('Error fetching room dashboard:', error);
        return { totalRoomStats: null, memberStats: [] };
    }
}
