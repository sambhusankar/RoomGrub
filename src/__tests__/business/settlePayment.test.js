import { settlePayment } from '@/app/[room_id]/splits/actions';

jest.mock('@/utils/supabase/server', () => ({ createClient: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

const { createClient } = require('@/utils/supabase/server');

function buildMockSupabase({ user, currentUser, expenses, insertError, settleError } = {}) {
  const chainMock = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: currentUser, error: null }),
    insert: jest.fn().mockResolvedValue({ error: insertError || null }),
  };

  // Override update chain to end with a resolved value
  const updateChain = {
    in: jest.fn().mockResolvedValue({ error: settleError || null }),
  };
  chainMock.update.mockReturnValue(updateChain);

  // or() is the last call on the expenses query — resolve with expenses data
  chainMock.or.mockResolvedValue({ data: expenses, error: null });

  const mockSupabase = {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
        error: user ? null : new Error('no user'),
      }),
    },
    from: jest.fn().mockReturnValue(chainMock),
  };

  return mockSupabase;
}

describe('settlePayment', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns error when user is not authenticated', async () => {
    createClient.mockResolvedValue(buildMockSupabase({ user: null }));
    const result = await settlePayment('1', 'member@test.com');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Unauthorized/);
  });

  it('returns error when user is not Admin', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Member', room: 1 },
    }));
    const result = await settlePayment('1', 'member@test.com');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/admin/i);
  });

  it("returns error when user's room doesn't match roomId", async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Admin', room: 99 },
    }));
    const result = await settlePayment('1', 'member@test.com');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not a member/i);
  });

  it('returns error when member has no unsettled expenses', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Admin', room: 1 },
      expenses: [],
    }));
    const result = await settlePayment('1', 'member@test.com');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/No pending expenses/);
  });

  it('builds balance records with negated amount and spending_id', async () => {
    const mockSupabase = buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Admin', room: 1 },
      expenses: [{ id: 10, money: 300 }, { id: 11, money: 150 }],
    });
    createClient.mockResolvedValue(mockSupabase);

    const result = await settlePayment('1', 'member@test.com');

    expect(result.success).toBe(true);
    expect(result.expensesSettled).toBe(2);

    const insertCall = mockSupabase.from().insert.mock.calls[0][0];
    expect(insertCall[0]).toMatchObject({ amount: -300, status: 'debit', spending_id: 10 });
    expect(insertCall[1]).toMatchObject({ amount: -150, status: 'debit', spending_id: 11 });
  });

  it('returns error when balance insert fails', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Admin', room: 1 },
      expenses: [{ id: 10, money: 100 }],
      insertError: new Error('DB error'),
    }));
    const result = await settlePayment('1', 'member@test.com');
    expect(result.success).toBe(false);
  });
});
