export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  totalRows,
}) {
  const lastPage = Math.max(1, totalPages);
  const page = Math.min(Math.max(1, currentPage), lastPage);
  return (
    <nav className="admin-pagination" aria-label="Navigasi halaman tabel">
      <div>
        {onRowsPerPageChange && (
          <label>
            Baris per halaman{' '}
            <select
              value={rowsPerPage}
              onChange={(event) =>
                onRowsPerPageChange(Number(event.target.value))
              }
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
        {totalRows != null && <span>{totalRows} hasil</span>}
      </div>
      <div>
        <button
          type="button"
          className="button-secondary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Sebelumnya
        </button>
        <span aria-live="polite">
          {page} / {lastPage}
        </span>
        <button
          type="button"
          className="button-secondary"
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
        >
          Berikutnya
        </button>
      </div>
    </nav>
  );
}
