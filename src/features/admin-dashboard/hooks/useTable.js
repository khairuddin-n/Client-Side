import { useMemo, useState } from 'react';

export function useTable(rows = []) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('id-ID');
    const result = rows.filter(
      (row) =>
        !normalized ||
        Object.values(row).some(
          (value) =>
            value != null &&
            String(value).toLocaleLowerCase('id-ID').includes(normalized),
        ),
    );
    if (!sort) return result;
    return [...result].sort((a, b) => {
      const left = a[sort.key];
      const right = b[sort.key];
      const comparison =
        typeof left === 'number' && typeof right === 'number'
          ? left - right
          : String(left ?? '').localeCompare(String(right ?? ''), 'id', {
              numeric: true,
            });
      return comparison * (sort.direction === 'asc' ? 1 : -1);
    });
  }, [rows, query, sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  return {
    data: filtered.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage,
    ),
    query,
    sort,
    rowsPerPage,
    currentPage,
    totalPages,
    totalRows: filtered.length,
    search: (value) => {
      setQuery(value);
      setPage(1);
    },
    onSort: (key) => {
      setSort((previous) =>
        previous?.key === key && previous.direction === 'asc'
          ? { key, direction: 'desc' }
          : { key, direction: 'asc' },
      );
      setPage(1);
    },
    onPageChange: setPage,
    onRowsPerPageChange: (value) => {
      setRowsPerPage(value);
      setPage(1);
    },
  };
}
