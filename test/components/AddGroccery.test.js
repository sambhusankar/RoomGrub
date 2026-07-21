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

    await waitFor(() => expect(addExpense).toHaveBeenCalledWith('42', 'Milk', '250', '', 'me@x.com'));
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
