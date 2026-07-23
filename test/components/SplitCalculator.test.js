/** @jest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SplitCalculator from '@/app/[room_id]/splits/_components/SplitCalculator';
import { settleAllPending } from '@/app/[room_id]/splits/actions';

jest.mock('@/app/[room_id]/splits/actions', () => ({
  settleAllPending: jest.fn(),
}));

const refresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

const members = [
  { id: 1, email: 'me@x.com', name: 'Me', pending_amount: 150 },
  { id: 2, email: 'friend@x.com', name: 'Friend', pending_amount: -150 },
];

const settlements = [
  { fromEmail: 'friend@x.com', fromName: 'Friend', toEmail: 'me@x.com', toName: 'Me', amount: 150 },
];

const expenses = [{ id: 1, money: '300' }];

describe('SplitCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders member balances and the who-pays-whom breakdown from precomputed backend data', () => {
    render(
      <SplitCalculator
        expenses={expenses}
        members={members}
        settlements={settlements}
        roomId="42"
        userRole="Admin"
      />
    );

    expect(screen.getAllByText('Me').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Friend').length).toBeGreaterThan(0);
    expect(screen.getByText('Gets back')).toBeInTheDocument();
    expect(screen.getByText('Owes')).toBeInTheDocument();

    expect(screen.getByText('Who Pays Whom')).toBeInTheDocument();
    expect(screen.getByText('pays')).toBeInTheDocument();

    // Transfers Needed tile reflects settlements.length
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });

  it('shows "All Clear" when there are no pending settlements', () => {
    const evenMembers = [
      { id: 1, email: 'me@x.com', name: 'Me', pending_amount: 0 },
      { id: 2, email: 'friend@x.com', name: 'Friend', pending_amount: 0 },
    ];

    render(
      <SplitCalculator
        expenses={[]}
        members={evenMembers}
        settlements={[]}
        roomId="42"
        userRole="Admin"
      />
    );

    expect(screen.getByText('All Clear!')).toBeInTheDocument();
    expect(screen.queryByText('Settle All')).not.toBeInTheDocument();
  });

  it('calls settleAllPending with the full member balances when Settle All is clicked', async () => {
    settleAllPending.mockResolvedValue({ success: true, expensesSettled: 1, settledCount: 2 });
    const user = userEvent.setup();

    render(
      <SplitCalculator
        expenses={expenses}
        members={members}
        settlements={settlements}
        roomId="42"
        userRole="Admin"
      />
    );

    const settleButton = screen.getByRole('button', { name: /Settle All/ });
    await user.click(settleButton);

    await waitFor(() => expect(settleAllPending).toHaveBeenCalledTimes(1));
    const [roomIdArg, memberBalancesArg] = settleAllPending.mock.calls[0];
    expect(roomIdArg).toBe('42');
    expect(memberBalancesArg).toHaveLength(2);
    expect(memberBalancesArg[0]).toMatchObject({ member: members[0], balance: 150, status: 'credit' });
    expect(memberBalancesArg[1]).toMatchObject({ member: members[1], balance: -150, status: 'debit' });

    expect(await screen.findByText(/Successfully settled/)).toBeInTheDocument();
  });

  it('does not render the Settle All button for non-admin users', () => {
    render(
      <SplitCalculator
        expenses={expenses}
        members={members}
        settlements={settlements}
        roomId="42"
        userRole="Member"
      />
    );

    expect(screen.queryByRole('button', { name: /Settle All/ })).not.toBeInTheDocument();
  });
});
