import { useNavigate } from 'react-router-dom';
import Dialog from '@/shared/components/Dialog.jsx';
import { formatCurrency, formatDate } from '@/shared/lib/format.js';

export default function TransactionDetailModal({
  transaction,
  onClose,
  onSplitBill,
  productType = 'SAV',
}) {
  const navigate = useNavigate();
  const canSplit = productType === 'SAV' && transaction?.debit_credit === 'D';
  if (!transaction) return null;
  function split() {
    onClose();
    if (transaction.split_bill_id)
      navigate(
        '/splitbill/detail?bill=' +
          encodeURIComponent(transaction.split_bill_id),
      );
    else onSplitBill?.(transaction);
  }
  return (
    <Dialog title="Detail transaksi" onClose={onClose}>
      <strong className="dialog-amount">
        {formatCurrency(transaction.amount)}
      </strong>
      <dl className="detail-list">
        {[
          ['ID transaksi', transaction.transactionId],
          ['Tanggal', formatDate(transaction.transactionDate)],
          ['Jenis', transaction.type || transaction.transactionType],
          ['Keterangan', transaction.detail || transaction.partyName],
          ['Detail penerima', transaction.partyDetail],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value || '—'}</dd>
          </div>
        ))}
      </dl>
      {canSplit && (transaction.split_bill_id || onSplitBill) && (
        <button type="button" className="button-primary" onClick={split}>
          {transaction.split_bill_id ? 'Lihat split bill' : 'Buat split bill'}
        </button>
      )}
    </Dialog>
  );
}
