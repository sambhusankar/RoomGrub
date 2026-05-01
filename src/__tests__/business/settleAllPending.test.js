import { settleAllPending } from '@/app/[room_id]/splits/actions';

jest.mock('@/utils/supabase/server', () => ({ createClient: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

const { createClient } = require('@/utils/supabase/server');

// The action does:
//   1. auth.getUser()
//   2. from('Users').eq('email').single()                     → currentUser { id }
//   3. from('UserRooms').eq('user_id').eq('room_id').single() → currentMembership { role }
//   4. Promise.all([
//        from('Spendings').select().in().eq().or()...         → expenses
//        from('balance').select().in().eq().eq().is()...      → payments (legacy debits)
//      ])
//   5. from('balance').insert(settlements)
//   6. from('Spendings').update().in(ids)
//   7. from('balance').delete()...                            → delete legacy debits

function buildMockSupabase({
  user,
  currentUser = null,
  currentMembership = null,
  expenses = [],
  payments = [],
  insertError = null,
  settleError = null,
  deleteError = null,
} = {}) {
  // Helper: make an object thenable so Promise.all() can await it
  const thenable = (data, error) => ({
    then: jest.fn((cb) => Promise.resolve(cb({ data, error: error || null }))),
  });

  // Spendings query chain ending in a thenable (for Promise.all)
  const spendingsChain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    ...thenable(expenses, null),
  };

  // balance query chain for the parallel payments fetch (thenable)
  const paymentsChain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    ...thenable(payments, null),
  };

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
        ...spendingsChain,
        update: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({ error: settleError || null }),
        }),
      };
    }
    if (table === 'balance') {
      return {
        ...paymentsChain,
        insert: jest.fn().mockResolvedValue({ error: insertError || null }),
        delete: jest.fn().mockReturnValue({
          in: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          is: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnValue(thenable(null, deleteError)),
          ...thenable(null, deleteError),
        }),
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

const memberBalances = [
  {
    member: { email: 'member@test.com', name: 'Member' },
    balance: 300,
    pendingAmount: 300,
  },
];

describe('settleAllPending', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns error when not authenticated', async () => {
    createClient.mockResolvedValue(buildMockSupabase({ user: null }));
    const result = await settleAllPending('1', memberBalances);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Unauthorized/);
  });

  it('returns error when caller is not a member of the room', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'user@test.com' },
      currentUser: { id: 1 },
      currentMembership: null,
    }));
    const result = await settleAllPending('1', memberBalances);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not a member/i);
  });

  it('returns error when caller is not Admin', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'user@test.com' },
      currentUser: { id: 1 },
      currentMembership: { role: 'Member' },
    }));
    const result = await settleAllPending('1', memberBalances);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/admin/i);
  });

  it('returns error when no members have balance > 0.01', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1 },
      currentMembership: { role: 'Admin' },
    }));
    const zeroBalances = [{ member: { email: 'member@test.com', name: 'Member' }, balance: 0, pendingAmount: 0 }];
    const result = await settleAllPending('1', zeroBalances);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/No pending/i);
  });

  it('returns mismatch error when amounts differ by more than 0.01', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1 },
      currentMembership: { role: 'Admin' },
      expenses: [{ id: 1, money: '500', user: 'member@test.com' }],
      payments: [],
    }));
    const mismatchedBalances = [{
      member: { email: 'member@test.com', name: 'Member' },
      balance: 300,
      pendingAmount: 300, // server calculates 500, diff = 200 > 0.01
    }];
    const result = await settleAllPending('1', mismatchedBalances);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/mismatch/i);
  });

  it('accepts amount within 0.01 rounding tolerance', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1 },
      currentMembership: { role: 'Admin' },
      expenses: [{ id: 1, money: '300.005', user: 'member@test.com' }],
      payments: [],
    }));
    const balances = [{
      member: { email: 'member@test.com', name: 'Member' },
      balance: 300,
      pendingAmount: 300, // diff = 0.005 < 0.01 → passes
    }];
    const result = await settleAllPending('1', balances);
    expect(result.success).toBe(true);
  });

  it('creates one balance record per expense', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1 },
      currentMembership: { role: 'Admin' },
      expenses: [
        { id: 10, money: '100', user: 'member@test.com' },
        { id: 11, money: '200', user: 'member@test.com' },
      ],
      payments: [],
    }));
    const balances = [{
      member: { email: 'member@test.com', name: 'Member' },
      balance: 300,
      pendingAmount: 300,
    }];
    const result = await settleAllPending('1', balances);
    expect(result.success).toBe(true);
    expect(result.expensesSettled).toBe(2);
  });

  it('accounts for legacy debit payments in pending calculation', async () => {
    // expenses = 400, legacy payments = -100 → actualPending = 300
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1 },
      currentMembership: { role: 'Admin' },
      expenses: [{ id: 1, money: '400', user: 'member@test.com' }],
      payments: [{ amount: '-100', user: 'member@test.com' }],
    }));
    const balances = [{
      member: { email: 'member@test.com', name: 'Member' },
      balance: 300,
      pendingAmount: 300,
    }];
    const result = await settleAllPending('1', balances);
    expect(result.success).toBe(true);
  });
});
