import { ArrowUpDown } from 'lucide-react';

export default function DataTable({
  title,
  columns,
  data = [],
  sortConfig,
  onSort,
  renderCell,
  searchBar,
}) {
  return (
    <section className="admin-table-panel">
      <header className="admin-table-heading">
        <h2>{title}</h2>
        {searchBar}
      </header>
      <div className="table-responsive-wrapper">
        <table className="admin-data-table">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    column.sortable
                      ? sortConfig?.key === column.key
                        ? sortConfig.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                      : undefined
                  }
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className="table-sort-button"
                      onClick={() => onSort?.(column.key)}
                    >
                      {column.label}
                      <ArrowUpDown size={14} aria-hidden="true" />
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-empty">
                  Tidak ada data yang sesuai.
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={
                    row.id ??
                    row.userId ??
                    row.activityId ??
                    row.transactionId ??
                    index
                  }
                >
                  {columns.map((column) => (
                    <td key={column.key}>
                      {renderCell
                        ? renderCell(row, column, index)
                        : (row[column.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
