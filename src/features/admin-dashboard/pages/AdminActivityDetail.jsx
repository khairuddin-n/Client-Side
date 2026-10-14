import { useCallback, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import AdminLayout from '@/features/admin-dashboard/components/AdminLayout.jsx';
import ActivityReviewDialog from '@/features/admin-dashboard/components/ActivityReviewDialog.jsx';
import PageState from '@/shared/components/PageState.jsx';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource.js';
import { useSession } from '@/features/auth/hooks/useSession.js';
import { canReviewActivity } from '@/features/admin-dashboard/lib/permissions.js';
import { fetchAdminActivityDetail } from '@/features/admin-dashboard/api/activities.api.js';
import { formatDate } from '@/shared/lib/format.js';

export default function AdminActivityDetail() {
  const [params] = useSearchParams();
  const { state } = useLocation();
  const id = params.get('activity') || state?.activityId;
  const load = useCallback(() => fetchAdminActivityDetail(id), [id]);
  const { data, loading, error, refetch } = useAsyncResource(load);
  const session = useSession();
  const [review, setReview] = useState(null);
  const [notice, setNotice] = useState('');
  return (
    <AdminLayout
      title="Detail aktivitas"
      description={
        data?.activityId || 'Periksa detail permintaan dan alur persetujuan.'
      }
      actions={
        <Link className="button-secondary" to="/admin/activity">
          ← Semua aktivitas
        </Link>
      }
    >
      {loading ? (
        <PageState loading />
      ) : error ? (
        <PageState
          title="Detail aktivitas belum dapat dimuat"
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
            <h2>Informasi permintaan</h2>
            <dl className="detail-list">
              {[
                ['Status', data.activityData?.activityStatus],
                ['Menu', data.menuData?.menuName],
                ['Tindakan', data.menuData?.menuAction],
                ['Alur', data.menuData?.actionFlow],
                [
                  'Nasabah',
                  data.activityData?.customerName || data.activityData?.userId,
                ],
                ['Alasan', data.activityData?.reason],
                ['Pembuat', data.makerData?.fullName || data.createdBy],
                ['Checker', data.checkerData?.fullName],
                ['Approver', data.approverData?.fullName],
                ['Dibuat', formatDate(data.createdTime)],
                ['Diperiksa', formatDate(data.checkerUpdatedTime)],
                ['Disetujui', formatDate(data.approverUpdatedTime)],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value || '—'}</dd>
                </div>
              ))}
            </dl>
          </section>
          <div className="admin-detail-actions">
            {canReviewActivity(data, session) ? (
              <>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setReview(false)}
                >
                  Tolak
                </button>
                <button
                  type="button"
                  className="button-primary"
                  onClick={() => setReview(true)}
                >
                  Setujui
                </button>
              </>
            ) : (
              <p className="field-help">
                Tindakan hanya tersedia untuk checker atau approver yang
                ditugaskan pada tahap aktif.
              </p>
            )}
          </div>
          {review !== null && (
            <ActivityReviewDialog
              activity={data}
              approve={review}
              onClose={() => setReview(null)}
              onSaved={() => {
                setReview(null);
                setNotice('Keputusan berhasil diproses.');
                refetch();
              }}
            />
          )}
        </>
      )}
    </AdminLayout>
  );
}
