import DataTable from '@/features/admin-dashboard/components/DataTable.jsx';
import SearchBar from '@/features/admin-dashboard/components/SearchBar.jsx';
import Pagination from '@/features/admin-dashboard/components/Pagination.jsx';
import { useTable } from '@/features/admin-dashboard/hooks/useTable.js';

export default function AdminTable({ title, columns, rows, renderCell }) {
  const table = useTable(rows);
  return (
    <>
      <DataTable
        title={title}
        columns={columns}
        data={table.data}
        sortConfig={table.sort}
        onSort={table.onSort}
        renderCell={renderCell}
        searchBar={<SearchBar value={table.query} onChange={table.search} />}
      />
      <Pagination {...table} />
    </>
  );
}
