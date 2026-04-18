import { updateMemberRole, removeMember, exitRoom } from '@/app/[room_id]/members/actions';

jest.mock('@/utils/supabase/server', () => ({ createClient: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

const { createClient } = require('@/utils/supabase/server');

function buildMockSupabase({ user, currentUser, targetMember, updateError } = {}) {
  let callCount = 0;

  const chainMock = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(() => {
      callCount++;
      // First single() = currentUser, second = targetMember
      if (callCount === 1) return Promise.resolve({ data: currentUser, error: null });
      return Promise.resolve({ data: targetMember, error: targetMember ? null : new Error('not found') });
    }),
    update: jest.fn().mockReturnThis(),
  };

  const updateChain = {
    eq: jest.fn().mockReturnThis(),
    then: jest.fn().mockResolvedValue({ error: updateError || null }),
  };
  // make update().eq().eq() resolve
  chainMock.update.mockReturnValue({
    eq: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: updateError || null }),
    }),
  });

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

describe('updateMemberRole', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns error when not authenticated', async () => {
    createClient.mockResolvedValue(buildMockSupabase({ user: null }));
    const result = await updateMemberRole('1', 'member@test.com', 'Admin');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Unauthorized/);
  });

  it('returns error when caller is not Admin', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'user@test.com' },
      currentUser: { role: 'Member', room: 1, email: 'user@test.com' },
    }));
    const result = await updateMemberRole('1', 'other@test.com', 'Admin');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/admin/i);
  });

  it("returns error when caller's room doesn't match", async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Admin', room: 99, email: 'admin@test.com' },
    }));
    const result = await updateMemberRole('1', 'other@test.com', 'Member');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not a member/i);
  });

  it('returns error when admin tries to demote themselves', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Admin', room: 1, email: 'admin@test.com' },
    }));
    const result = await updateMemberRole('1', 'admin@test.com', 'Member');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/demote yourself/i);
  });

  it('returns error for invalid role value', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Admin', room: 1, email: 'admin@test.com' },
    }));
    const result = await updateMemberRole('1', 'other@test.com', 'SuperAdmin');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/Invalid role/);
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

  it('returns error when caller is not Admin', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'user@test.com' },
      currentUser: { role: 'Member', room: 1, email: 'user@test.com' },
    }));
    const result = await removeMember('1', 'other@test.com');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/admin/i);
  });

  it('returns error when admin tries to remove themselves', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Admin', room: 1, email: 'admin@test.com' },
    }));
    const result = await removeMember('1', 'admin@test.com');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/cannot remove themselves/i);
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

  it('returns error when admin tries to exit', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'admin@test.com' },
      currentUser: { role: 'Admin', room: 1, email: 'admin@test.com' },
    }));
    const result = await exitRoom('1');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/cannot leave/i);
  });

  it('returns error when user is not in the room', async () => {
    createClient.mockResolvedValue(buildMockSupabase({
      user: { email: 'user@test.com' },
      currentUser: { role: 'Member', room: 99, email: 'user@test.com' },
    }));
    const result = await exitRoom('1');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not a member/i);
  });
});
