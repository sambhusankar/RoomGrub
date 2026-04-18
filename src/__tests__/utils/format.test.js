import { formatCurrency, formatDate } from '@/utils/format';

describe('formatCurrency', () => {
  it('formats a whole number', () => {
    expect(formatCurrency(100)).toBe('₹100.00');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('₹0.00');
  });

  it('formats a decimal amount', () => {
    expect(formatCurrency(1234.5)).toBe('₹1234.50');
  });

  it('formats a string amount', () => {
    expect(formatCurrency('50.5')).toBe('₹50.50');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatCurrency(99.999)).toBe('₹100.00');
  });

  it('formats a negative amount', () => {
    expect(formatCurrency(-50)).toBe('₹-50.00');
  });
});

describe('formatDate', () => {
  it('returns a non-empty string for a valid ISO date', () => {
    const result = formatDate('2024-01-15');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes the day, month, and year', () => {
    const result = formatDate('2024-06-20');
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/6|06/);
    expect(result).toMatch(/20/);
  });
});
