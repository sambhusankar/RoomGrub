/** @jest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddGrocery from '@/app/[room_id]/addgroccery/_components/AddGroccery';
import { getRoomMembersForRoom, addExpense, addGroceryForFriend } from '@/app/[room_id]/addgroccery/actions';

jest.mock('@/app/[room_id]/addgroccery/actions', () => ({
  getRoomMembersForRoom: jest.fn(),
  addExpense: jest.fn(),
  addGroceryForFriend: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useParams: () => ({ room_id: '42' }),
}));

const currentUser = { id: 1, user_id: 'u1', name: 'Me', email: 'me@x.com', profile: null };
const friend = { id: 2, user_id: 'u2', name: 'Friend', email: 'friend@x.com', profile: null };

describe('AddGrocery - add expense flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getRoomMembersForRoom.mockResolvedValue({
      members: [currentUser],
      currentUser,
      currentUserEmail: 'me@x.com',
    });
  });

  it('submits the expected payload to addExpense and shows a success message', async () => {
    addExpense.mockResolvedValue({ success: true, message: 'Expense added!' });
    const user = userEvent.setup();

    render(<AddGrocery userRole="Member" />);

    await waitFor(() => expect(getRoomMembersForRoom).toHaveBeenCalledWith('42'));

    const amountInput = screen.getByPlaceholderText('0');
    const descriptionInput = screen.getByPlaceholderText('What did you buy?');

    await user.type(amountInput, '250');
    await user.type(descriptionInput, 'Milk');

    const submitButton = screen.getByRole('button', { name: 'Add Expense' });
    await user.click(submitButton);

    await waitFor(() => expect(addExpense).toHaveBeenCalledWith('42', 'Milk', '250', '', ['u1']));
    expect(addGroceryForFriend).not.toHaveBeenCalled();

    expect(await screen.findByText('✅ Expense added!')).toBeInTheDocument();
    expect(amountInput).toHaveValue('');
    expect(descriptionInput).toHaveValue('');
  });

  it('shows the backend error message when the request fails', async () => {
    addExpense.mockResolvedValue({ success: false, error: 'Bad request' });
    const user = userEvent.setup();

    render(<AddGrocery userRole="Member" />);
    await waitFor(() => expect(getRoomMembersForRoom).toHaveBeenCalled());

    await user.type(screen.getByPlaceholderText('0'), '99');
    await user.type(screen.getByPlaceholderText('What did you buy?'), 'Eggs');
    await user.click(screen.getByRole('button', { name: 'Add Expense' }));

    expect(await screen.findByText('❌ Bad request')).toBeInTheDocument();
  });

  it('keeps the submit button disabled until amount and description are filled', async () => {
    addExpense.mockResolvedValue({ success: true });
    const user = userEvent.setup();

    render(<AddGrocery userRole="Member" />);
    await waitFor(() => expect(getRoomMembersForRoom).toHaveBeenCalled());

    const submitButton = screen.getByRole('button', { name: 'Add Expense' });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByPlaceholderText('0'), '10');
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByPlaceholderText('What did you buy?'), 'Bread');
    expect(submitButton).toBeEnabled();
  });
});

describe('AddGrocery - participant picker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getRoomMembersForRoom.mockResolvedValue({
      members: [currentUser, friend],
      currentUser,
      currentUserEmail: 'me@x.com',
    });
  });

  it('defaults to all room members selected as participants', async () => {
    addExpense.mockResolvedValue({ success: true });
    const user = userEvent.setup();

    render(<AddGrocery userRole="Member" />);
    await waitFor(() => expect(getRoomMembersForRoom).toHaveBeenCalled());

    expect(await screen.findByText('Everyone')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('0'), '100');
    await user.type(screen.getByPlaceholderText('What did you buy?'), 'Rice');
    await user.click(screen.getByRole('button', { name: 'Add Expense' }));

    await waitFor(() =>
      expect(addExpense).toHaveBeenCalledWith('42', 'Rice', '100', '', ['u1', 'u2'])
    );
  });

  // Participant picker is temporarily disabled; these interaction tests are skipped until it's re-enabled.
  it.skip('allows deselecting a non-payer participant and sends the reduced list', async () => {
    addExpense.mockResolvedValue({ success: true });
    const user = userEvent.setup();

    render(<AddGrocery userRole="Member" />);
    await waitFor(() => expect(getRoomMembersForRoom).toHaveBeenCalled());

    await user.click(screen.getByText('Everyone'));
    await user.click(screen.getByText('Friend'));

    expect(await screen.findByText('1 people')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('0'), '100');
    await user.type(screen.getByPlaceholderText('What did you buy?'), 'Rice');
    await user.click(screen.getByRole('button', { name: 'Add Expense' }));

    await waitFor(() =>
      expect(addExpense).toHaveBeenCalledWith('42', 'Rice', '100', '', ['u1'])
    );
  });

  it.skip('does not allow deselecting the payer from the participant list', async () => {
    addExpense.mockResolvedValue({ success: true });
    const user = userEvent.setup();

    render(<AddGrocery userRole="Member" />);
    await waitFor(() => expect(getRoomMembersForRoom).toHaveBeenCalled());

    await user.click(screen.getByText('Everyone'));
    // "Me" is the current payer by default — try to deselect them.
    const meOption = screen.getByText((content) => content.includes('Me'));
    await user.click(meOption);

    // Still "Everyone" since the payer could not be removed.
    expect(await screen.findByText('Everyone')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('0'), '100');
    await user.type(screen.getByPlaceholderText('What did you buy?'), 'Rice');
    await user.click(screen.getByRole('button', { name: 'Add Expense' }));

    await waitFor(() =>
      expect(addExpense).toHaveBeenCalledWith('42', 'Rice', '100', '', ['u1', 'u2'])
    );
  });

  it.skip('never lets the participant list drop to zero since the payer is always locked in', async () => {
    addExpense.mockResolvedValue({ success: true });
    const user = userEvent.setup();

    render(<AddGrocery userRole="Member" />);
    await waitFor(() => expect(getRoomMembersForRoom).toHaveBeenCalled());

    await user.click(screen.getByText('Everyone'));
    // Try to remove everyone, including the payer.
    await user.click(screen.getByText('Friend'));
    const meOption = screen.getByText((content) => content.includes('Me'));
    await user.click(meOption);

    await user.type(screen.getByPlaceholderText('0'), '100');
    await user.type(screen.getByPlaceholderText('What did you buy?'), 'Rice');
    await user.click(screen.getByRole('button', { name: 'Add Expense' }));

    await waitFor(() =>
      expect(addExpense).toHaveBeenCalledWith('42', 'Rice', '100', '', ['u1'])
    );
  });
});
