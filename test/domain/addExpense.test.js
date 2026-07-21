import { addExpense, addGroceryForFriend } from '@/app/[room_id]/addgroccery/actions';
import { auth } from '@/auth';
import { backendJson } from '@/utils/backend';

jest.mock('@/auth', () => ({ auth: jest.fn() }));
jest.mock('@/utils/backend', () => ({ backendJson: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }));

describe('addExpense', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue({ user: { email: 'me@x.com' } });
  });

  it('sends the expected payload without a date', async () => {
    backendJson.mockResolvedValue({ id: 1 });

    const result = await addExpense('42', 'Milk', '250', '', 'me@x.com');

    expect(backendJson).toHaveBeenCalledWith('/api/v1/rooms/42/expenses', {
      method: 'POST',
      body: JSON.stringify({ material: 'Milk', money: 250 }),
    });
    expect(result).toEqual({ success: true });
  });

  it('includes created_at when a date is provided', async () => {
    backendJson.mockResolvedValue({ id: 1 });

    await addExpense('42', 'Milk', '250', '2026-01-15', 'me@x.com');

    expect(backendJson).toHaveBeenCalledWith('/api/v1/rooms/42/expenses', {
      method: 'POST',
      body: JSON.stringify({
        material: 'Milk',
        money: 250,
        created_at: new Date('2026-01-15').toISOString(),
      }),
    });
  });

  it('returns the backend error detail on failure', async () => {
    backendJson.mockRejectedValue({ status: 400, detail: 'Bad request' });

    const result = await addExpense('42', 'Milk', '250', '', 'me@x.com');

    expect(result).toEqual({ success: false, error: 'Bad request' });
  });

  it('returns Unauthorized without calling the backend when there is no session', async () => {
    auth.mockResolvedValue(null);

    const result = await addExpense('42', 'Milk', '250', '', 'me@x.com');

    expect(backendJson).not.toHaveBeenCalled();
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });
});

describe('addGroceryForFriend', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue({ user: { email: 'me@x.com' } });
  });

  it('sends the expected payload including the friend user_id', async () => {
    backendJson.mockResolvedValue({ id: 2 });

    const result = await addGroceryForFriend('42', 'friend-1', '  Eggs  ', '99', '');

    expect(backendJson).toHaveBeenCalledWith('/api/v1/rooms/42/expenses/for-member', {
      method: 'POST',
      body: JSON.stringify({ material: 'Eggs', money: 99, user_id: 'friend-1' }),
    });
    expect(result).toEqual({ success: true });
  });

  it('includes created_at when a date is provided', async () => {
    backendJson.mockResolvedValue({ id: 2 });

    await addGroceryForFriend('42', 'friend-1', 'Eggs', '99', '2026-02-01');

    expect(backendJson).toHaveBeenCalledWith('/api/v1/rooms/42/expenses/for-member', {
      method: 'POST',
      body: JSON.stringify({
        material: 'Eggs',
        money: 99,
        user_id: 'friend-1',
        created_at: new Date('2026-02-01').toISOString(),
      }),
    });
  });

  it('returns the backend error detail on failure', async () => {
    backendJson.mockRejectedValue({ status: 500, detail: 'Server error' });

    const result = await addGroceryForFriend('42', 'friend-1', 'Eggs', '99', '');

    expect(result).toEqual({ success: false, error: 'Server error' });
  });

  it('returns Unauthorized without calling the backend when there is no session', async () => {
    auth.mockResolvedValue(null);

    const result = await addGroceryForFriend('42', 'friend-1', 'Eggs', '99', '');

    expect(backendJson).not.toHaveBeenCalled();
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });
});
