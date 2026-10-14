import { Download } from 'lucide-react';
import { formatCurrency } from '@/shared/lib/format.js';
import PageState from '@/shared/components/PageState.jsx';

export default function TransactionHistory({
  transactions = [],
  months = [],
  selectedMonth,
  onMonthChange,
  onTransactionClick,
  title = 'Riwayat transaksi',
  showDownloadButton = false,
  onDownload,
  loading = false,
  emptyMessage = 'Tidak ada transaksi untuk periode ini.',
}) {
  return (
    <section className="statement-history" aria-busy={loading}>
      <header className="statement-heading">
        <h2>{title}</h2>
        {showDownloadButton && (
          <button
            type="button"
            className="button-secondary"
            onClick={onDownload}
            disabled={loading || transactions.length === 0}
          >
            <Download size={16} aria-hidden="true" /> Ekspor CSV
          </button>
        )}
      </header>
      {months.length > 0 && (
        <div className="statement-months" aria-label="Periode transaksi">
          {months.map((month) => (
            <button
              type="button"
              key={`${month.month}-${month.year}`}
              aria-pressed={
                selectedMonth?.month === month.month &&
                selectedMonth?.year === month.year
              }
              onClick={() => onMonthChange(month)}
            >
              {month.label}
              <span>{month.year}</span>
            </button>
          ))}
        </div>
      )}
      {loading ? (
        <PageState loading />
      ) : transactions.length === 0 ? (
        <PageState message={emptyMessage} />
      ) : (
        <div className="statement-groups">
          {transactions.map((group) => (
            <section key={group.key}>
              <h3>{group.date}</h3>
              <ul>
                {group.items.map((item, index) => (
                  <li key={item.transactionId || `${group.key}-${index}`}>
                    <button
                      type="button"
                      className="statement-row"
                      onClick={() => onTransactionClick?.(item)}
                    >
                      <span>
                        <strong>{item.type || 'Transaksi'}</strong>
                        <span>{item.detail || '—'}</span>
                      </span>
                      <span
                        className={
                          item.debit_credit === 'C' ? 'amount-credit' : ''
                        }
                      >
                        {formatCurrency(item.amount)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
