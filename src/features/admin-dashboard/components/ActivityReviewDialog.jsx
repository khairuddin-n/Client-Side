import { useCallback, useState } from 'react';
import Dialog from '@/shared/components/Dialog.jsx';
import PageState from '@/shared/components/PageState.jsx';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction.js';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource.js';
import {
  fetchApproverList,
  postAdminApproval,
} from '@/features/admin-dashboard/api/activities.api.js';

export default function ActivityReviewDialog({
  activity,
  approve,
  onClose,
  onSaved,
}) {
  const needsApprover =
    approve && activity.activityData?.activityStatus === 'PENDING_CHECKER';
  const [approverId, setApproverId] = useState('');
  const load = useCallback(
    async () => (needsApprover ? (await fetchApproverList()).data : []),
    [needsApprover],
  );
  const approvers = useAsyncResource(load);
  const { pending, error, run } = useAsyncAction();
  function submit(event) {
    event.preventDefault();
    run(async () => {
      const approver = approvers.data?.find(
        (item) => item.userId === approverId,
      );
      if (needsApprover && !approver)
        throw new Error('Pilih approver yang valid.');
      const response = await postAdminApproval({
        activityId: activity.activityId,
        isApprove: approve,
        approverData: approver
          ? {
              userId: approver.userId,
              npp: approver.npp,
              fullName: approver.fullName,
            }
          : {},
      });
      if (!response.ok)
        throw new Error(
          response.message || 'Aktivitas belum dapat diperbarui.',
        );
      onSaved();
    });
  }
  return (
    <Dialog
      title={approve ? 'Setujui aktivitas' : 'Tolak aktivitas'}
      onClose={() => {
        if (!pending) onClose();
      }}
    >
      <p>
        {approve
          ? 'Konfirmasikan persetujuan untuk'
          : 'Konfirmasikan penolakan untuk'}{' '}
        aktivitas <strong>{activity.activityId}</strong>.
      </p>
      {approvers.loading ? (
        <PageState loading />
      ) : approvers.error ? (
        <PageState
          title="Approver belum dapat dimuat"
          message={approvers.error}
          onRetry={approvers.refetch}
        />
      ) : (
        <form
          className="admin-detail-form"
          onSubmit={submit}
          aria-busy={pending}
        >
          {needsApprover && (
            <div className="form-field">
              <label htmlFor="approver">Approver</label>
              <select
                id="approver"
                value={approverId}
                onChange={(event) => setApproverId(event.target.value)}
                required
                disabled={pending}
              >
                <option value="">Pilih approver</option>
                {approvers.data.map((approver) => (
                  <option key={approver.userId} value={approver.userId}>
                    {approver.displayName || approver.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            <button
              type="button"
              className="button-secondary"
              disabled={pending}
              onClick={onClose}
            >
              Batal
            </button>
            <button type="submit" className="button-primary" disabled={pending}>
              {pending ? 'Memproses…' : 'Konfirmasi'}
            </button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
