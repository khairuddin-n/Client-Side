import { Link } from 'react-router-dom';
import AdminLayout from '@/features/admin-dashboard/components/AdminLayout.jsx';
import AdminMetrics from '@/features/admin-dashboard/components/AdminMetrics.jsx';
import AdminTable from '@/features/admin-dashboard/components/AdminTable.jsx';
import PageState from '@/shared/components/PageState.jsx';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource.js';
import { fetchAdminDashboard } from '@/features/admin-dashboard/api/dashboard.api.js';
import { formatCurrency } from '@/shared/lib/format.js';

async function loadDashboard() {
  return (await fetchAdminDashboard()).data;
}
const columns = [
  { key: 'customerId', label: 'CIF', sortable: true },
  { key: 'customerName', label: 'Nasabah', sortable: true },
  { key: 'action', label: 'Tindakan' },
];

export default function AdminHome() {
  const { data, loading, error, refetch } = useAsyncResource(loadDashboard);
  return (
    <AdminLayout
      title="Ringkasan"
      description="Pantau portofolio dan aktivitas keuangan nasabah."
    >
      {loading ? (
        <PageState loading />
      ) : error ? (
        <PageState
          title="Ringkasan belum dapat dimuat"
          message={error}
          onRetry={refetch}
        />
      ) : (
        <>
          <AdminMetrics
            items={[
              ['Total aset', formatCurrency(data.totalAsset)],
              ['Tabungan', formatCurrency(data.totalSaving)],
              ['Deposito', formatCurrency(data.totalTimeDeposit)],
              ['Life goals', formatCurrency(data.totalLifegoals)],
              ['Dana pensiun', formatCurrency(data.totalPensionFund)],
            ]}
          />
          <section className="content-panel admin-category-panel">
            <h2>Kategori transaksi</h2>
            <ul className="category-list">
              {(data.categories || []).map((category) => (
                <li key={category.categoryName}>
                  <span>{category.categoryName}</span>
                  <strong>
                    {formatCurrency(category.total)} · {category.percentage}%
                  </strong>
                </li>
              ))}
            </ul>
            {!data.categories?.length && <p>Belum ada transaksi.</p>}
          </section>
          <AdminTable
            title="Nasabah"
            columns={columns}
            rows={(data.users || []).map((user) => ({
              ...user,
              id: user.userid,
            }))}
            renderCell={(row, column) =>
              column.key === 'action' ? (
                <Link
                  className="table-action-link"
                  to={
                    '/admin/transactions?user=' + encodeURIComponent(row.userid)
                  }
                >
                  Lihat transaksi
                </Link>
              ) : (
                row[column.key]
              )
            }
          />
        </>
      )}
    </AdminLayout>
  );
}
