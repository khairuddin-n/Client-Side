import { useCallback } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import AdminLayout from '@/features/admin-dashboard/components/AdminLayout.jsx';
import AdminTable from '@/features/admin-dashboard/components/AdminTable.jsx';
import PageState from '@/shared/components/PageState.jsx';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource.js';
import { fetchAdminTransactionList } from '@/features/admin-dashboard/api/transactions.api.js';
import {
  formatCurrency,
  formatDate,
  maskAccount,
} from '@/shared/lib/format.js';

const columns = [
  { key: 'paymentTime', label: 'Tanggal', sortable: true },
  { key: 'productTypeLabel', label: 'Produk', sortable: true },
  { key: 'accountNumber', label: 'Rekening' },
  { key: 'transactionCategory', label: 'Kategori', sortable: true },
  { key: 'transactionAmount', label: 'Nominal', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
];

export default function AdminTransactions() {
  const [params] = useSearchParams();
  const { state } = useLocation();
  const userId = params.get('user') || state?.userId;
  const load = useCallback(
    async () => (await fetchAdminTransactionList(userId)).data,
    [userId],
  );
  const { data, loading, error, refetch } = useAsyncResource(load);
  return (
    <AdminLayout
      title="Transaksi nasabah"
      description={
        data?.customerName || 'Lihat riwayat transaksi nasabah terpilih.'
      }
      actions={
        <Link className="button-secondary" to="/admin/home">
          ← Ringkasan
        </Link>
      }
    >
      {loading ? (
        <PageState loading />
      ) : error ? (
        <PageState
          title="Transaksi belum dapat dimuat"
          message={error}
          onRetry={refetch}
        />
      ) : (
        <AdminTable
          title="Riwayat transaksi"
          columns={columns}
          rows={data.transactionHistories || []}
          renderCell={(row, column) =>
            column.key === 'transactionAmount'
              ? formatCurrency(row.transactionAmount)
              : column.key === 'paymentTime'
                ? formatDate(row.paymentTime)
                : column.key === 'accountNumber'
                  ? maskAccount(row.accountNumber)
                  : row[column.key]
          }
        />
      )}
    </AdminLayout>
  );
}
