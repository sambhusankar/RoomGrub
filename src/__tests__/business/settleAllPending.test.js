import { settleAllPending } from '@/app/[room_id]/splits/actions';

jest.mock('@/utils/supabase/server', () => ({ createClient: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

const { createClient } = require('@/utils/supabase/server');

function buildMockSupabase({ user, currentUser, expenses = [], payments = [], insertError, settleError, deleteError } = {}) {
  const queryChain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    status: 'debit',
  };

  // Promise.all([expensesQuery, paymentsQuery]) — both need to resolve
  // The chain ends at lte/is/or, so make the whole chain thenable
  let expensesResolved = false;
  const thenableMixin = (data, error) => ({
    then: jest.fn((cb) => Promise.resolve(cb({ data, error: error || null }))),
  });

  // We need two separate query objects for the two parallel queries
  const expensesChain = { ...queryChain, ...thenableMixin(expenses, null) };
  const paymentsChain = { ...queryChain, ...thenableMixin(payments, null) };

  let fromCallCount = 0;
  const mockFrom = jest.fn().mockImplementation((table) => {
    if (table === 'Users') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: currentUser, error: null }),
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
          lte: jest.fn().mockResolvedValue({ error: deleteError || null }),
          then: jest.fn((cb) => Promise.resolve(cb({ error: deleteError || null }))),
        }),
      };
    }
    // Spendings
    return {
      ...expensesChain,
      update: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({ error: settleError || null }),
      }),
    };
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

  it('returns error when caller is not Admin', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'user@test.com' },
      currentUser: { role: 'Member', room: 1 },
    }));
    const result = await settleAllPending('1', memberBalances);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/admin/i);
  });

  it('returns error when no members have balance > 0.01', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Admin', room: 1 },
    }));
    const zeroBalances = [{ member: { email: 'member@test.com', name: 'Member' }, balance: 0, pendingAmount: 0 }];
    const result = await settleAllPending('1', zeroBalances);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/No pending/i);
  });

  it('returns mismatch error when amounts differ by more than 0.01', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Admin', room: 1 },
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
      currentUser: { role: 'Admin', room: 1 },
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
    const mockSupabase = buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Admin', room: 1 },
      expenses: [
        { id: 10, money: '100', user: 'member@test.com' },
        { id: 11, money: '200', user: 'member@test.com' },
      ],
      payments: [],
    });
    createClient.mockResolvedValue(mockSupabase);

    const balances = [{
      member: { email: 'member@test.com', name: 'Member' },
      balance: 300,
      pendingAmount: 300,
    }];
    const result = await settleAllPending('1', balances);
    expect(result.success).toBe(true);
    expect(result.expensesSettled).toBe(2);
  });
});
