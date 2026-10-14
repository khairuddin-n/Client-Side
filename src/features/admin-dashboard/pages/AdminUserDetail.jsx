import { useCallback, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import AdminLayout from '@/features/admin-dashboard/components/AdminLayout.jsx';
import AdminTable from '@/features/admin-dashboard/components/AdminTable.jsx';
import UserStatusDialog from '@/features/admin-dashboard/components/UserStatusDialog.jsx';
import PageState from '@/shared/components/PageState.jsx';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource.js';
import { fetchAdminUserDetail } from '@/features/admin-dashboard/api/user-detail.api.js';
import { fetchMenuAccess } from '@/features/admin-dashboard/api/users.api.js';
import { canChangeUser } from '@/features/admin-dashboard/lib/permissions.js';
import { formatCurrency, maskAccount } from '@/shared/lib/format.js';

const columns = [
  { key: 'accountNumber', label: 'Rekening' },
  { key: 'productName', label: 'Produk', sortable: true },
  { key: 'accountStatus', label: 'Status', sortable: true },
  { key: 'effectiveBalance', label: 'Saldo', sortable: true },
];

export default function AdminUserDetail() {
  const [params] = useSearchParams();
  const { state } = useLocation();
  const userId = params.get('user') || state?.userId;
  const [action, setAction] = useState(null);
  const [notice, setNotice] = useState('');
  const load = useCallback(async () => {
    const [user, access] = await Promise.allSettled([
      fetchAdminUserDetail(userId),
      fetchMenuAccess(),
    ]);
    if (user.status === 'rejected') throw user.reason;
    return {
      user: user.value.data,
      access: access.status === 'fulfilled' ? access.value.data : null,
    };
  }, [userId]);
  const { data, loading, error, refetch } = useAsyncResource(load);
  const user = data?.user;
  const blocked = user?.blocked ?? user?.isBlocked;
  const actionName = blocked ? 'unblock' : 'block';
  const rule =
    data?.access?.USER_MANAGEMENT?.[blocked ? 'UNBLOCK_USER' : 'BLOCK_USER'];
  return (
    <AdminLayout
      title={user?.customerName || 'Detail nasabah'}
      description="Informasi rekening dan pengelolaan status nasabah."
      actions={
        <Link className="button-secondary" to="/admin/users">
          ← Semua nasabah
        </Link>
      }
    >
      {loading ? (
        <PageState loading />
      ) : error ? (
        <PageState
          title="Detail nasabah belum dapat dimuat"
          message={error}
          onRetry={refetch}
        />
      ) : (
        <>
          {notice && (
            <p className="form-notice" role="status">
              {notice}
            </p>
          )}
          <section className="content-panel">
            <dl className="detail-list">
              {[
                ['ID nasabah', user.userId],
                ['CIF', user.customerId],
                ['Status', blocked ? 'Diblokir' : 'Aktif'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="admin-detail-actions">
              {canChangeUser(rule) ? (
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setAction(actionName)}
                >
                  {blocked ? 'Buka blokir' : 'Blokir nasabah'}
                </button>
              ) : (
                <p className="field-help">
                  Izin perubahan status tidak tersedia untuk sesi ini.
                </p>
              )}
            </div>
          </section>
          <div style={{ marginTop: '1.5rem' }}>
            <AdminTable
              title="Rekening nasabah"
              columns={columns}
              rows={(user.accounts || []).map((account) => ({
                ...account,
                id: account.accountNumber,
              }))}
              renderCell={(row, column) =>
                column.key === 'effectiveBalance'
                  ? formatCurrency(row.effectiveBalance)
                  : column.key === 'accountNumber'
                    ? maskAccount(row.accountNumber)
                    : row[column.key]
              }
            />
          </div>
          {action && (
            <UserStatusDialog
              user={user}
              action={action}
              rule={rule}
              onClose={() => setAction(null)}
              onSaved={() => {
                setAction(null);
                setNotice('Permintaan perubahan status berhasil diproses.');
                refetch();
              }}
            />
          )}
        </>
      )}
    </AdminLayout>
  );
}
