import { describe, expect, it } from 'vitest';
import { csvCell, toCsv } from '@/shared/lib/csv.js';
import { lastTwelveMonths, maskAccount } from '@/shared/lib/format.js';
import {
  groupTransactions,
  transactionTotals,
} from '@/shared/lib/transactions.js';
import { validateMembers } from '@/features/split-bill/lib/validation.js';
import { normalizeBill } from '@/features/split-bill/api/split-bill.api.js';

describe('financial data and exports', () => {
  it('uses the current year across the twelve-month boundary', () => {
    const months = lastTwelveMonths(new Date(2026, 0, 15));
    expect(months[0]).toMatchObject({ month: 2, year: 2025 });
    expect(months.at(-1)).toMatchObject({ month: 1, year: 2026 });
  });
  it.each([
    '=HYPERLINK("https://example.com")',
    '+SUM(A1)',
    '-CMD()',
    '@SUM(A1)',
    '  =1+1',
    '\t=1+1',
  ])('neutralizes spreadsheet formulas: %s', (value) => {
    expect(csvCell(value).startsWith('"\'')).toBe(true);
  });
  it('escapes commas, quotes, and newlines and preserves numeric debits', () => {
    expect(csvCell('A, "B"\nC')).toBe('"A, ""B""\nC"');
    expect(csvCell(-25.5)).toBe('"-25.5"');
    expect(
      toCsv([
        ['Nama', 'Nilai'],
        ['Nasabah', -25.5],
      ]),
    ).toContain('\r\n');
  });
  it('masks account numbers', () =>
    expect(maskAccount('1234567890')).toBe('•••• 7890'));
  it('groups by complete date and preserves monetary precision', () => {
    const groups = groupTransactions([
      {
        transactionDate: '2026-01-01T10:00:00',
        amount: 25.5,
        debitCredit: 'D',
      },
      {
        transactionDate: '2025-01-01T10:00:00',
        amount: 100.75,
        debitCredit: 'C',
      },
    ]);
    expect(groups).toHaveLength(2);
    expect(transactionTotals(groups)).toEqual({
      income: 100.75,
      expense: 25.5,
    });
  });
  it('rejects invalid splits instead of accepting zero, negative, or mismatched shares', () => {
    expect(validateMembers([{ member_name: 'A', amount: 0 }], 100)).not.toBe(
      '',
    );
    expect(validateMembers([{ member_name: 'A', amount: -100 }], 100)).not.toBe(
      '',
    );
    expect(validateMembers([{ member_name: 'A', amount: 99 }], 100)).not.toBe(
      '',
    );
    expect(validateMembers([{ member_name: 'A', amount: 100 }], 100)).toBe('');
  });
  it('normalizes server payment status and preserves account metadata', () => {
    const bill = normalizeBill({
      splitBillId: 'bill-1',
      accountNumber: '123',
      totalBill: 200,
      members: [
        { memberId: '1', amount: 100, hasPaid: true },
        { memberId: '2', amount: 100, hasPaid: false },
      ],
    });
    expect(bill).toMatchObject({
      split_bill_id: 'bill-1',
      account_number: '123',
      remaining_bill: 100,
    });
  });
});
