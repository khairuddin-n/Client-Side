import { useCallback, useState } from 'react';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource.js';
import { fetchTransactions } from '@/shared/api/transactions.js';
import { lastTwelveMonths, formatCurrency } from '@/shared/lib/format.js';
import {
  groupTransactions,
  transactionTotals,
} from '@/shared/lib/transactions.js';
import { downloadCsv } from '@/shared/lib/csv.js';
import TransactionHistory from '@/shared/components/TransactionHistory.jsx';
import TransactionDetailModal from '@/shared/components/TransactionDetailModal.jsx';
import SplitBillForm from '@/features/split-bill/components/SplitBillForm.jsx';
import PageState from '@/shared/components/PageState.jsx';

export default function StatementPanel({ accountNumber, productType = 'SVG' }) {
  const [months] = useState(lastTwelveMonths);
  const [month, setMonth] = useState(months.at(-1));
  const [selected, setSelected] = useState(null);
  const [splitTransaction, setSplitTransaction] = useState(null);
  const [notice, setNotice] = useState('');
  const load = useCallback(
    async (signal) => {
      if (!accountNumber) return [];
      const data = await fetchTransactions(
        { accountNumber, productType, month: month.month, year: month.year },
        signal,
      );
      return groupTransactions(data.transactions);
    },
    [accountNumber, productType, month],
  );
  const {
    data: transactions,
    loading,
    error,
    refetch,
  } = useAsyncResource(load);
  const totals = transactionTotals(transactions || []);
  function download() {
    const rows = [
      [
        'Tanggal',
        'ID transaksi',
        'Jenis',
        'Keterangan',
        'Nominal',
        'Debit/Kredit',
      ],
      ...(transactions || []).flatMap((group) =>
        group.items.map((item) => [
          item.transactionDate,
          item.transactionId,
          item.type,
          item.detail,
          item.amount,
          item.debit_credit,
        ]),
      ),
    ];
    downloadCsv(rows, `transaksi_${month.year}_${month.month}.csv`);
  }
  if (!accountNumber)
    return (
      <PageState message="Pilih rekening untuk melihat riwayat transaksi." />
    );
  return (
    <div className="statement-panel">
      {notice && (
        <p role="status" className="form-notice">
          {notice}
        </p>
      )}
      <div className="statement-totals">
        <div>
          <span>Pemasukan periode ini</span>
          <strong>{formatCurrency(totals.income)}</strong>
        </div>
        <div>
          <span>Pengeluaran periode ini</span>
          <strong>{formatCurrency(totals.expense)}</strong>
        </div>
      </div>
      {error && (
        <PageState
          title="Transaksi belum dapat dimuat"
          message={error}
          onRetry={refetch}
        />
      )}
      <TransactionHistory
        transactions={transactions || []}
        months={months}
        selectedMonth={month}
        onMonthChange={setMonth}
        loading={loading}
        onTransactionClick={setSelected}
        showDownloadButton
        onDownload={download}
      />
      {selected && (
        <TransactionDetailModal
          transaction={selected}
          onClose={() => setSelected(null)}
          productType={productType === 'SVG' ? 'SAV' : productType}
          onSplitBill={(transaction) =>
            setSplitTransaction({ ...transaction, accountNumber })
          }
        />
      )}
      {splitTransaction && (
        <SplitBillForm
          transaction={splitTransaction}
          onClose={() => setSplitTransaction(null)}
          onSuccess={() => {
            setSplitTransaction(null);
            setNotice('Split bill berhasil dibuat.');
            refetch();
          }}
        />
      )}
    </div>
  );
}
