import { settlePayment } from '@/app/[room_id]/splits/actions';

jest.mock('@/utils/supabase/server', () => ({ createClient: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

const { createClient } = require('@/utils/supabase/server');

// The action does:
//   1. auth.getUser()
//   2. from('Users').eq('email').single()           → currentUser { id }
//   3. from('UserRooms').eq('user_id').eq('room_id').single() → currentMembership { role }
//   4. from('Spendings').eq().or()                  → expenses
//   5. from('balance').insert(balanceRecords)
//   6. from('Spendings').update().in(ids)

function buildMockSupabase({
  user,
  currentUser = null,
  currentMembership = null,
  expenses,
  insertError = null,
  settleError = null,
} = {}) {
  const mockFrom = jest.fn().mockImplementation((table) => {
    if (table === 'Users') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: currentUser, error: currentUser ? null : new Error('not found') }),
      };
    }
    if (table === 'UserRooms') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: currentMembership, error: currentMembership ? null : new Error('not found') }),
      };
    }
    if (table === 'Spendings') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        or: jest.fn().mockResolvedValue({ data: expenses, error: null }),
        update: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({ error: settleError || null }),
        }),
      };
    }
    if (table === 'balance') {
      return {
        insert: jest.fn().mockResolvedValue({ error: insertError || null }),
      };
    }
    return { select: jest.fn().mockReturnThis(), eq: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: null }) };
  });

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
        error: user ? null : new Error('no user'),
      }),
    },
    from: mockFrom,
  };
}

describe('settlePayment', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns error when user is not authenticated', async () => {
    createClient.mockResolvedValue(buildMockSupabase({ user: null }));
    const result = await settlePayment('1', 'member@test.com');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Unauthorized/);
  });

  it('returns error when user is not a member of the room', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1 },
      currentMembership: null,
    }));
    const result = await settlePayment('1', 'member@test.com');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not a member/i);
  });

  it('returns error when user is not Admin', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'user@test.com' },
      currentUser: { id: 1 },
      currentMembership: { role: 'Member' },
    }));
    const result = await settlePayment('1', 'member@test.com');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/admin/i);
  });

  it('returns error when member has no unsettled expenses', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1 },
      currentMembership: { role: 'Admin' },
      expenses: [],
    }));
    const result = await settlePayment('1', 'member@test.com');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/No pending expenses/);
  });

  it('builds balance records with negated amount and spending_id', async () => {
    const mockSupabase = buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1 },
      currentMembership: { role: 'Admin' },
      expenses: [{ id: 10, money: 300 }, { id: 11, money: 150 }],
    });
    createClient.mockResolvedValue(mockSupabase);

    const result = await settlePayment('1', 'member@test.com');
    expect(result.success).toBe(true);
    expect(result.expensesSettled).toBe(2);

    const balanceInsertCalls = mockSupabase.from.mock.results
      .filter((_, i) => mockSupabase.from.mock.calls[i][0] === 'balance')
      .map(r => r.value.insert.mock.calls)
      .flat();
    expect(balanceInsertCalls[0][0][0]).toMatchObject({ amount: -300, status: 'debit', spending_id: 10 });
    expect(balanceInsertCalls[0][0][1]).toMatchObject({ amount: -150, status: 'debit', spending_id: 11 });
  });

  it('returns error when balance insert fails', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1 },
      currentMembership: { role: 'Admin' },
      expenses: [{ id: 10, money: 100 }],
      insertError: new Error('DB error'),
    }));
    const result = await settlePayment('1', 'member@test.com');
    expect(result.success).toBe(false);
  });
});
