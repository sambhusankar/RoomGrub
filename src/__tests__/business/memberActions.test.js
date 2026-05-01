import { updateMemberRole, removeMember, exitRoom } from '@/app/[room_id]/members/actions';

jest.mock('@/utils/supabase/server', () => ({ createClient: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

const { createClient } = require('@/utils/supabase/server');

// The new actions use two-step DB lookups:
//   1. from('Users').select().eq('email').single()      → currentUser { id, email }
//   2. from('UserRooms').select().eq('user_id').eq('room_id').single() → membership { role }
// For updateMemberRole/removeMember there are additional lookups for the target member.

function buildMockSupabase({
  user,
  currentUser = null,
  currentMembership = null,
  targetUser = null,
  targetMembership = null,
  updateError = null,
  deleteError = null,
  room = null,
} = {}) {
  // Track across multiple from('UserRooms') calls
  let userRoomsCallCount = 0;

  // Each table returns a different mock
  const mockFrom = jest.fn().mockImplementation((table) => {
    if (table === 'Users') {
      let callCount = 0;
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          callCount++;
          // First Users lookup = current user, second = target member
          if (callCount === 1) return Promise.resolve({ data: currentUser, error: currentUser ? null : new Error('not found') });
          return Promise.resolve({ data: targetUser, error: targetUser ? null : new Error('not found') });
        }),
      };
    }
    if (table === 'UserRooms') {
      // Track across multiple from('UserRooms') calls using a shared counter on the outer scope
      userRoomsCallCount++;
      const thisCallIndex = userRoomsCallCount;
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          // Call 1 = caller's membership, call 2 = target's membership
          if (thisCallIndex === 1) return Promise.resolve({ data: currentMembership, error: currentMembership ? null : new Error('not found') });
          return Promise.resolve({ data: targetMembership, error: targetMembership ? null : new Error('not found') });
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: updateError }),
          }),
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: deleteError }),
          }),
        }),
      };
    }
    if (table === 'Rooms') {
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: room || { members: 2 }, error: null }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
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

describe('updateMemberRole', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns error when not authenticated', async () => {
    createClient.mockResolvedValue(buildMockSupabase({ user: null }));
    const result = await updateMemberRole('1', 'member@test.com', 'Admin');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Unauthorized/);
  });

  it('returns error when caller is not a member of the room', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'user@test.com' },
      currentUser: { id: 1, email: 'user@test.com' },
      currentMembership: null, // no UserRooms record
    }));
    const result = await updateMemberRole('1', 'other@test.com', 'Admin');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not a member/i);
  });

  it('returns error when caller is not Admin', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'user@test.com' },
      currentUser: { id: 1, email: 'user@test.com' },
      currentMembership: { role: 'Member' },
    }));
    const result = await updateMemberRole('1', 'other@test.com', 'Admin');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/admin/i);
  });

  it('returns error when admin tries to demote themselves', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1, email: 'admin@test.com' },
      currentMembership: { role: 'Admin' },
    }));
    const result = await updateMemberRole('1', 'admin@test.com', 'Member');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/demote yourself/i);
  });

  it('returns error for invalid role value', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1, email: 'admin@test.com' },
      currentMembership: { role: 'Admin' },
    }));
    const result = await updateMemberRole('1', 'other@test.com', 'SuperAdmin');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Invalid role/);
  });

  it('returns success when admin updates a member role', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1, email: 'admin@test.com' },
      currentMembership: { role: 'Admin' },
      targetUser: { id: 2, email: 'member@test.com' },
      targetMembership: { role: 'Member' },
    }));
    const result = await updateMemberRole('1', 'member@test.com', 'Admin');
    expect(result.success).toBe(true);
  });
});

describe('removeMember', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns error when not authenticated', async () => {
    createClient.mockResolvedValue(buildMockSupabase({ user: null }));
    const result = await removeMember('1', 'member@test.com');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Unauthorized/);
  });

  it('returns error when caller is not a member of the room', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'user@test.com' },
      currentUser: { id: 1, email: 'user@test.com' },
      currentMembership: null,
    }));
    const result = await removeMember('1', 'other@test.com');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not a member/i);
  });

  it('returns error when caller is not Admin', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'user@test.com' },
      currentUser: { id: 1, email: 'user@test.com' },
      currentMembership: { role: 'Member' },
    }));
    const result = await removeMember('1', 'other@test.com');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/admin/i);
  });

  it('returns error when admin tries to remove themselves', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1, email: 'admin@test.com' },
      currentMembership: { role: 'Admin' },
    }));
    const result = await removeMember('1', 'admin@test.com');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/cannot remove themselves/i);
  });

  it('returns success when admin removes a member', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1, email: 'admin@test.com' },
      currentMembership: { role: 'Admin' },
      targetUser: { id: 2, email: 'member@test.com' },
      targetMembership: { id: 5 },
    }));
    const result = await removeMember('1', 'member@test.com');
    expect(result.success).toBe(true);
  });
});

describe('exitRoom', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns error when not authenticated', async () => {
    createClient.mockResolvedValue(buildMockSupabase({ user: null }));
    const result = await exitRoom('1');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Unauthorized/);
  });

  it('returns error when user is not in the room', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'user@test.com' },
      currentUser: { id: 1, email: 'user@test.com' },
      currentMembership: null,
    }));
    const result = await exitRoom('1');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not a member/i);
  });

  it('returns error when admin tries to exit', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { id: 1, email: 'admin@test.com' },
      currentMembership: { role: 'Admin' },
    }));
    const result = await exitRoom('1');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/cannot leave/i);
  });

  it('returns success when a member exits the room', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'member@test.com' },
      currentUser: { id: 2, email: 'member@test.com' },
      currentMembership: { role: 'Member' },
    }));
    const result = await exitRoom('1');
    expect(result.success).toBe(true);
  });
});
