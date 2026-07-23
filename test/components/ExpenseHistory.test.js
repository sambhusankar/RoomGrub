/** @jest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpenseHistory from '@/app/[room_id]/expenses/_components/ExpenseHistory';
import { fetchPaginatedExpenses, getExpenseDetail } from '@/app/[room_id]/expenses/actions';

jest.mock('@/app/[room_id]/expenses/actions', () => ({
  fetchPaginatedExpenses: jest.fn(),
  getExpenseDetail: jest.fn(),
}));

// jsdom doesn't implement IntersectionObserver.
beforeAll(() => {
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const initialExpenses = [
  {
    id: 101,
    material: 'Milk',
    money: '250',
    created_at: '2026-07-01T00:00:00.000Z',
    user: 'me@x.com',
    settled: false,
  },
];

describe('ExpenseHistory - expense detail popup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens the detail modal with participant breakdown when an expense card is clicked', async () => {
    getExpenseDetail.mockResolvedValue({
      success: true,
      detail: {
        material: 'Milk',
        money: 250,
        payer_name: 'Me',
        participants: [
          { user_id: 'u1', name: 'Me', amount_paid: 250, amount_owed: 125, net: 125 },
          { user_id: 'u2', name: 'Friend', amount_paid: 0, amount_owed: 125, net: -125 },
        ],
      },
    });
    const user = userEvent.setup();

    render(
      <ExpenseHistory
        initialExpenses={initialExpenses}
        initialCursor={null}
        initialHasMore={false}
        roomId="42"
        userMap={{}}
      />
    );

    await user.click(screen.getByText('Milk'));

    await waitFor(() => expect(getExpenseDetail).toHaveBeenCalledWith('42', 101));

    expect(await screen.findByText('Expense Details')).toBeInTheDocument();
    expect(screen.getByText('Participants')).toBeInTheDocument();
    expect(screen.getByText('Friend')).toBeInTheDocument();
    expect(screen.getByText(/paid ₹0 · owes ₹125/)).toBeInTheDocument();
  });

  it('shows an error message in the modal when the detail fetch fails', async () => {
    getExpenseDetail.mockResolvedValue({ success: false, error: 'Not found' });
    const user = userEvent.setup();

    render(
      <ExpenseHistory
        initialExpenses={initialExpenses}
        initialCursor={null}
        initialHasMore={false}
        roomId="42"
        userMap={{}}
      />
    );

    await user.click(screen.getByText('Milk'));

    expect(await screen.findByText('Not found')).toBeInTheDocument();
  });
});
