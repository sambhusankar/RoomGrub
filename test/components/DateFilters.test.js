/** @jest-environment jsdom */
import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import FilterPanel from '@/app/[room_id]/expenses/_components/FilterPanel';
import ActivityFilters from '@/app/[room_id]/settings/activities/_components/ActivityFilters';

function FilterHarness({ Component }) {
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  return (
    <Component
      filter=""
      textFilter=""
      userFilter=""
      dateRange={dateRange}
      setDateRange={setDateRange}
      userMap={{}}
      setFilter={() => {}}
      setTextFilter={() => {}}
      setUserFilter={() => {}}
      showAll={false}
      setShowAll={() => {}}
    />
  );
}

describe.each([
  ['expense', FilterPanel],
  ['activity', ActivityFilters],
])('%s date filters', (_name, Component) => {
  it('visibly labels both dates and keeps the labels after dates are entered', () => {
    render(<FilterHarness Component={Component} />);

    const from = screen.getByLabelText('From');
    const to = screen.getByLabelText('To');
    expect(screen.getByText('From')).toBeVisible();
    expect(screen.getByText('To')).toBeVisible();
    expect(from).toHaveValue('');
    expect(to).toHaveValue('');

    fireEvent.change(from, { target: { value: '2026-01-10' } });
    fireEvent.change(to, { target: { value: '2026-01-20' } });

    expect(from).toHaveValue('2026-01-10');
    expect(to).toHaveValue('2026-01-20');
    expect(screen.getByText('From')).toBeVisible();
    expect(screen.getByText('To')).toBeVisible();
  });

  it('keeps labels and date values separate when two filters are rendered', () => {
    render(<>
      <FilterHarness Component={Component} />
      <FilterHarness Component={Component} />
    </>);

    const fromInputs = screen.getAllByLabelText('From');
    const toInputs = screen.getAllByLabelText('To');
    expect(fromInputs).toHaveLength(2);
    expect(toInputs).toHaveLength(2);
    expect(new Set([...fromInputs, ...toInputs].map(input => input.id)).size).toBe(4);

    fireEvent.change(fromInputs[0], { target: { value: '2026-01-10' } });
    expect(fromInputs[0]).toHaveValue('2026-01-10');
    expect(fromInputs[1]).toHaveValue('');
    expect(toInputs[0]).toHaveValue('');
    expect(toInputs[1]).toHaveValue('');
  });
});
