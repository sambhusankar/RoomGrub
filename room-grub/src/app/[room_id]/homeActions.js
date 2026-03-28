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

        // Total purchases for current user in this room
        const { data: spendingsData } = await supabase
            .from('Spendings')
            .select('money')
            .eq('user', session.user.email)
            .eq('room', roomId);

        const totalPurchases = (spendingsData || []).reduce(
            (sum, s) => sum + parseFloat(s.money || 0),
            0
        );

        // Debit balance records (negative amounts, reduce pending)
        const { data: balanceData } = await supabase
            .from('balance')
            .select('amount')
            .eq('user', session.user.email)
            .eq('room', roomId)
            .eq('status', 'debit');

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
