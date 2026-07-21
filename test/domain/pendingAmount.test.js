// Tests for the core pending amount formula used in homeActions.js and splits/actions.js
// Formula: pendingAmount = Math.max(0, unsettledExpenses + legacyDebits)

function calcPending(spendings, debits) {
  const unsettled = spendings
    .filter(s => s.settled == null || s.settled === false)
    .reduce((sum, s) => sum + parseFloat(s.money || 0), 0);

  const received = debits
    .reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);

  return Math.max(0, unsettled + received);
}

describe('pending amount formula', () => {
  it('returns 0 when there are no expenses', () => {
    expect(calcPending([], [])).toBe(0);
  });

  it('returns total of unsettled expenses', () => {
    const spendings = [
      { money: 100, settled: false },
      { money: 200, settled: false },
    ];
    expect(calcPending(spendings, [])).toBe(300);
  });

  it('treats NULL settled as unsettled', () => {
    const spendings = [{ money: 150, settled: null }];
    expect(calcPending(spendings, [])).toBe(150);
  });

  it('excludes settled expenses', () => {
    const spendings = [
      { money: 100, settled: true },
      { money: 200, settled: false },
    ];
    expect(calcPending(spendings, [])).toBe(200);
  });

  it('reduces pending when debits (negative amounts) are present', () => {
    const spendings = [{ money: 500, settled: false }];
    const debits = [{ amount: -200 }];
    expect(calcPending(spendings, debits)).toBe(300);
  });

  it('never returns a negative value', () => {
    const spendings = [{ money: 100, settled: false }];
    const debits = [{ amount: -500 }];
    expect(calcPending(spendings, debits)).toBe(0);
  });

  it('returns 0 when all expenses are settled and no debits', () => {
    const spendings = [
      { money: 100, settled: true },
      { money: 200, settled: true },
    ];
    expect(calcPending(spendings, [])).toBe(0);
  });

  it('handles mixed settled/unsettled correctly', () => {
    const spendings = [
      { money: 100, settled: true },
      { money: 200, settled: false },
      { money: 50, settled: null },
    ];
    expect(calcPending(spendings, [])).toBe(250);
  });
});
