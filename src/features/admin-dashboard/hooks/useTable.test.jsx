import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTable } from '@/features/admin-dashboard/hooks/useTable.js';

describe('table state', () => {
  it('clamps the visible page after rows shrink and resets on search', () => {
    const rows = Array.from({ length: 25 }, (_, id) => ({
      id,
      name: 'User ' + id,
    }));
    const { result, rerender } = renderHook(({ rows }) => useTable(rows), {
      initialProps: { rows },
    });
    act(() => result.current.onPageChange(3));
    expect(result.current.data).toHaveLength(5);
    rerender({ rows: rows.slice(0, 2) });
    expect(result.current.currentPage).toBe(1);
    expect(result.current.data).toHaveLength(2);
    act(() => result.current.search('No match'));
    expect(result.current.totalPages).toBe(1);
    expect(result.current.data).toHaveLength(0);
  });
  it('sorts numbers numerically and tolerates missing values', () => {
    const { result } = renderHook(() =>
      useTable([
        { id: 'a', count: 10 },
        { id: 'b', count: 2 },
      ]),
    );
    act(() => result.current.onSort('count'));
    expect(result.current.data.map((row) => row.count)).toEqual([2, 10]);
  });
});
