import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/features/admin-dashboard/components/AdminLayout.jsx';
import AdminMetrics from '@/features/admin-dashboard/components/AdminMetrics.jsx';
import AdminTable from '@/features/admin-dashboard/components/AdminTable.jsx';
import PageState from '@/shared/components/PageState.jsx';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource.js';
import { fetchAdminUsers } from '@/features/admin-dashboard/api/users.api.js';

async function loadUsers() {
  return (await fetchAdminUsers()).data;
}
const columns = [
  { key: 'customerId', label: 'CIF', sortable: true },
  { key: 'customerName', label: 'Nama nasabah', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'countAccount', label: 'Jumlah rekening', sortable: true },
  { key: 'action', label: 'Tindakan' },
];

export default function AdminUsers() {
  const { data, loading, error, refetch } = useAsyncResource(loadUsers);
  const [status, setStatus] = useState('');
  const rows = useMemo(
    () =>
      (data?.users || [])
        .map((user) => ({
          ...user,
          id: user.userId,
          status: user.isBlocked ? 'Diblokir' : 'Aktif',
        }))
        .filter((user) => !status || user.status === status),
    [data, status],
  );
  return (
    <AdminLayout
      title="Nasabah"
      description="Lihat informasi nasabah dan pengelolaan status akun."
    >
      {loading ? (
        <PageState loading />
      ) : error ? (
        <PageState
          title="Nasabah belum dapat dimuat"
          message={error}
          onRetry={refetch}
        />
      ) : (
        <>
          <AdminMetrics
            items={[
              ['Total nasabah', data.totalUsers],
              ['Aktif', data.activeUsers],
              ['Diblokir', data.blockedUsers],
              [
                'Rata-rata rekening',
                Number(data.avgAccountPerUser || 0).toFixed(1),
              ],
            ]}
          />
          <label className="admin-filter">
            Status{' '}
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">Semua</option>
              <option>Aktif</option>
              <option>Diblokir</option>
            </select>
          </label>
          <AdminTable
            title="Daftar nasabah"
            columns={columns}
            rows={rows}
            renderCell={(row, column) =>
              column.key === 'action' ? (
                <Link
                  className="table-action-link"
                  to={
                    '/admin/users/detail?user=' + encodeURIComponent(row.userId)
                  }
                >
                  Lihat detail
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
