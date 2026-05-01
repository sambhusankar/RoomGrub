import { addGroceryForFriend } from '@/app/[room_id]/addgroccery/actions';

jest.mock('@/utils/supabase/server', () => ({ createClient: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));
jest.mock('@/services/NotificationService', () => ({
  notifyGroceryAdded: jest.fn().mockResolvedValue({}),
}));

const { createClient } = require('@/utils/supabase/server');
const NotificationService = require('@/services/NotificationService');

// The action does a two-step lookup for both the caller and the friend:
//   1. from('Users').eq('email', caller)  → currentUser { id, name }
//   2. from('UserRooms').eq('user_id').eq('room_id') → currentMembership { role }
//   3. from('Users').eq('email', friend)  → friendUser { id, email, name }
//   4. from('UserRooms').eq('user_id').eq('room_id') → friendMembership { id }

function buildMockSupabase({
  user,
  currentUser = null,
  currentMembership = null,
  friendUser = null,
  friendMembership = null,
  insertError = null,
} = {}) {
  const mockFrom = jest.fn().mockImplementation((table) => {
    if (table === 'Users') {
      let callCount = 0;
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return Promise.resolve({ data: currentUser, error: currentUser ? null : new Error('not found') });
          return Promise.resolve({ data: friendUser, error: friendUser ? null : new Error('not found') });
        }),
      };
    }
    if (table === 'UserRooms') {
      let callCount = 0;
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return Promise.resolve({ data: currentMembership, error: currentMembership ? null : new Error('not found') });
          return Promise.resolve({ data: friendMembership, error: friendMembership ? null : new Error('not found') });
        }),
      };
    }
    if (table === 'Spendings') {
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

describe('addGroceryForFriend', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns error when not authenticated', async () => {
    createClient.mockResolvedValue(buildMockSupabase({ user: null }));
    const result = await addGroceryForFriend('1', 'friend@test.com', 'Rice', '100', null);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Unauthorized/);
  });

  it('returns error when caller is not a member of the room', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'user@test.com' },
      currentUser: { id: 1, name: 'User' },
      currentMembership: null,
    }));
    const result = await addGroceryForFriend('1', 'friend@test.com', 'Rice', '100', null);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not a member/i);
  });

  it('returns error when caller is not Admin', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'user@test.com' },
      currentUser: { id: 1, name: 'User' },
      currentMembership: { role: 'Member' },
    }));
    const result = await addGroceryForFriend('1', 'friend@test.com', 'Rice', '100', null);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/admin/i);
  });

  it("returns error when caller's room doesn't match", async () => {
    // Simulated by currentMembership being null (no record in UserRooms for this room_id)
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1, name: 'Admin' },
      currentMembership: null,
    }));
    const result = await addGroceryForFriend('99', 'friend@test.com', 'Rice', '100', null);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not a member/i);
  });

  it('returns error for empty grocery name', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1, name: 'Admin' },
      currentMembership: { role: 'Admin' },
      friendUser: { id: 2, email: 'friend@test.com', name: 'Friend' },
      friendMembership: { id: 5 },
    }));
    const result = await addGroceryForFriend('1', 'friend@test.com', '   ', '100', null);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Grocery item is required/);
  });

  it('returns error for invalid price', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1, name: 'Admin' },
      currentMembership: { role: 'Admin' },
      friendUser: { id: 2, email: 'friend@test.com', name: 'Friend' },
      friendMembership: { id: 5 },
    }));
    const result = await addGroceryForFriend('1', 'friend@test.com', 'Rice', '-50', null);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Valid price is required/);
  });

  it('returns error for NaN price', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1, name: 'Admin' },
      currentMembership: { role: 'Admin' },
      friendUser: { id: 2, email: 'friend@test.com', name: 'Friend' },
      friendMembership: { id: 5 },
    }));
    const result = await addGroceryForFriend('1', 'friend@test.com', 'Rice', 'abc', null);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Valid price is required/);
  });

  it('succeeds and notification failure does not fail the operation', async () => {
    NotificationService.notifyGroceryAdded.mockRejectedValueOnce(new Error('push failed'));
    const mockSupabase = buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1, name: 'Admin' },
      currentMembership: { role: 'Admin' },
      friendUser: { id: 2, email: 'friend@test.com', name: 'Friend' },
      friendMembership: { id: 5 },
    });
    createClient.mockResolvedValue(mockSupabase);
    const result = await addGroceryForFriend('1', 'friend@test.com', 'Rice', '150', null);
    expect(result.success).toBe(true);
  });

  it('trims whitespace from grocery name before insert', async () => {
    const mockSupabase = buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1, name: 'Admin' },
      currentMembership: { role: 'Admin' },
      friendUser: { id: 2, email: 'friend@test.com', name: 'Friend' },
      friendMembership: { id: 5 },
    });
    createClient.mockResolvedValue(mockSupabase);
    await addGroceryForFriend('1', 'friend@test.com', '  Milk  ', '80', null);
    const spendingsFrom = mockSupabase.from.mock.calls.find(c => c[0] === 'Spendings');
    expect(spendingsFrom).toBeTruthy();
    const insertMock = mockSupabase.from('Spendings').insert;
    // Re-call to capture insert arg via a fresh spy isn't needed — verify via direct insert call tracking
    const insertCalls = mockSupabase.from.mock.results
      .filter((_, i) => mockSupabase.from.mock.calls[i][0] === 'Spendings')
      .map(r => r.value.insert.mock.calls)
      .flat();
    expect(insertCalls[0][0][0].material).toBe('Milk');
  });

  it('converts price string to float before insert', async () => {
    const mockSupabase = buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1, name: 'Admin' },
      currentMembership: { role: 'Admin' },
      friendUser: { id: 2, email: 'friend@test.com', name: 'Friend' },
      friendMembership: { id: 5 },
    });
    createClient.mockResolvedValue(mockSupabase);
    await addGroceryForFriend('1', 'friend@test.com', 'Bread', '75.50', null);
    const insertCalls = mockSupabase.from.mock.results
      .filter((_, i) => mockSupabase.from.mock.calls[i][0] === 'Spendings')
      .map(r => r.value.insert.mock.calls)
      .flat();
    expect(insertCalls[0][0][0].money).toBe(75.5);
    expect(typeof insertCalls[0][0][0].money).toBe('number');
  });
});
