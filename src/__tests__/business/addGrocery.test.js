import { addGroceryForFriend } from '@/app/[room_id]/addgroccery/actions';

jest.mock('@/utils/supabase/server', () => ({ createClient: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/services/NotificationService', () => ({
  notifyGroceryAdded: jest.fn().mockResolvedValue({}),
}));

const { createClient } = require('@/utils/supabase/server');
const NotificationService = require('@/services/NotificationService');

function buildMockSupabase({ user, currentUser, friendUser, insertError } = {}) {
  let callCount = 0;
  const chainMock = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve({ data: currentUser, error: null });
      return Promise.resolve({ data: friendUser, error: friendUser ? null : new Error('not found') });
    }),
    insert: jest.fn().mockResolvedValue({ error: insertError || null }),
  };

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
        error: user ? null : new Error('no user'),
      }),
    },
    from: jest.fn().mockReturnValue(chainMock),
  };
}

describe('addGroceryForFriend', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns error when not authenticated', async () => {
    createClient.mockResolvedValue(buildMockSupabase({ user: null }));
    const result = await addGroceryForFriend('1', 'friend@test.com', 'Rice', '100', null);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Unauthorized/);
  });

  it('returns error when caller is not Admin', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'user@test.com' },
      currentUser: { role: 'Member', room: 1, id: 1, name: 'User' },
    }));
    const result = await addGroceryForFriend('1', 'friend@test.com', 'Rice', '100', null);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/admin/i);
  });

  it("returns error when caller's room doesn't match", async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Admin', room: 99, id: 1, name: 'Admin' },
    }));
    const result = await addGroceryForFriend('1', 'friend@test.com', 'Rice', '100', null);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not a member/i);
  });

  it('returns error for empty grocery name', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Admin', room: 1, id: 1, name: 'Admin' },
      friendUser: { email: 'friend@test.com', room: 1, id: 2, name: 'Friend' },
    }));
    const result = await addGroceryForFriend('1', 'friend@test.com', '   ', '100', null);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Grocery item is required/);
  });

  it('returns error for invalid price', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Admin', room: 1, id: 1, name: 'Admin' },
      friendUser: { email: 'friend@test.com', room: 1, id: 2, name: 'Friend' },
    }));
    const result = await addGroceryForFriend('1', 'friend@test.com', 'Rice', '-50', null);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Valid price is required/);
  });

  it('returns error for NaN price', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Admin', room: 1, id: 1, name: 'Admin' },
      friendUser: { email: 'friend@test.com', room: 1, id: 2, name: 'Friend' },
    }));
    const result = await addGroceryForFriend('1', 'friend@test.com', 'Rice', 'abc', null);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Valid price is required/);
  });

  it('succeeds and notification failure does not fail the operation', async () => {
    NotificationService.notifyGroceryAdded.mockRejectedValueOnce(new Error('push failed'));
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Admin', room: 1, id: 1, name: 'Admin' },
      friendUser: { email: 'friend@test.com', room: 1, id: 2, name: 'Friend' },
    }));
    const result = await addGroceryForFriend('1', 'friend@test.com', 'Rice', '150', null);
    expect(result.success).toBe(true);
  });

  it('trims whitespace from grocery name before insert', async () => {
    const mockSupabase = buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Admin', room: 1, id: 1, name: 'Admin' },
      friendUser: { email: 'friend@test.com', room: 1, id: 2, name: 'Friend' },
    });
    createClient.mockResolvedValue(mockSupabase);
    await addGroceryForFriend('1', 'friend@test.com', '  Milk  ', '80', null);
    const insertCall = mockSupabase.from().insert.mock.calls[0][0];
    expect(insertCall[0].material).toBe('Milk');
  });

  it('converts price string to float before insert', async () => {
    const mockSupabase = buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Admin', room: 1, id: 1, name: 'Admin' },
      friendUser: { email: 'friend@test.com', room: 1, id: 2, name: 'Friend' },
    });
    createClient.mockResolvedValue(mockSupabase);
    await addGroceryForFriend('1', 'friend@test.com', 'Bread', '75.50', null);
    const insertCall = mockSupabase.from().insert.mock.calls[0][0];
    expect(insertCall[0].money).toBe(75.5);
    expect(typeof insertCall[0].money).toBe('number');
  });
});
