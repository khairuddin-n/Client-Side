import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/features/admin-dashboard/components/AdminLayout.jsx';
import AdminTable from '@/features/admin-dashboard/components/AdminTable.jsx';
import PageState from '@/shared/components/PageState.jsx';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource.js';
import { fetchAdminActivityList } from '@/features/admin-dashboard/api/activities.api.js';
import { formatDate } from '@/shared/lib/format.js';

async function loadActivities() {
  return (await fetchAdminActivityList()).data.activityList;
}
const columns = [
  { key: 'id', label: 'ID aktivitas', sortable: true },
  { key: 'actionFlow', label: 'Alur', sortable: true },
  { key: 'createdTime', label: 'Tanggal', sortable: true },
  { key: 'createdBy', label: 'Pembuat', sortable: true },
  { key: 'activityStatus', label: 'Status', sortable: true },
  { key: 'action', label: 'Tindakan' },
];

export default function AdminActivity() {
  const { data, loading, error, refetch } = useAsyncResource(loadActivities);
  const [status, setStatus] = useState('');
  const rows = useMemo(
    () =>
      (data || []).filter(
        (activity) => !status || activity.activityStatus === status,
      ),
    [data, status],
  );
  const statuses = [
    ...new Set(
      (data || []).map((activity) => activity.activityStatus).filter(Boolean),
    ),
  ];
  return (
    <AdminLayout
      title="Aktivitas"
      description="Pantau permintaan, pemeriksaan, dan persetujuan perubahan."
    >
      {loading ? (
        <PageState loading />
      ) : error ? (
        <PageState
          title="Aktivitas belum dapat dimuat"
          message={error}
          onRetry={refetch}
        />
      ) : (
        <>
          <label className="admin-filter">
            Status{' '}
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">Semua</option>
              {statuses.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <AdminTable
            title="Daftar aktivitas"
            columns={columns}
            rows={rows}
            renderCell={(row, column) =>
              column.key === 'action' ? (
                <Link
                  className="table-action-link"
                  to={
                    '/admin/activity/detail?activity=' +
                    encodeURIComponent(row.id)
                  }
                >
                  Lihat detail
                </Link>
              ) : column.key === 'createdTime' ? (
                formatDate(row.createdTime)
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
