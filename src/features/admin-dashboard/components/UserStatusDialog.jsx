import { useCallback, useState } from 'react';
import Dialog from '@/shared/components/Dialog.jsx';
import PageState from '@/shared/components/PageState.jsx';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource.js';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction.js';
import {
  fetchAdminBlock,
  fetchAdminUnBlock,
  fetchApproverList,
} from '@/features/admin-dashboard/api/users.api.js';

export default function UserStatusDialog({
  user,
  action,
  rule,
  onClose,
  onSaved,
}) {
  const [reason, setReason] = useState('');
  const [checkerId, setCheckerId] = useState('');
  const needsChecker = rule.action_flow === 'CHECKER_AND_APPROVER';
  const load = useCallback(
    () => (needsChecker ? fetchApproverList('CHECKER') : Promise.resolve([])),
    [needsChecker],
  );
  const checkers = useAsyncResource(load);
  const { pending, error, run } = useAsyncAction();
  function submit(event) {
    event.preventDefault();
    run(async () => {
      if (!reason.trim()) throw new Error('Alasan wajib diisi.');
      const checker = checkers.data?.find((item) => item.userId === checkerId);
      if (needsChecker && !checker)
        throw new Error('Pilih checker yang valid.');
      const response = await (
        action === 'block' ? fetchAdminBlock : fetchAdminUnBlock
      )({
        userData: { userId: user.userId },
        reason: reason.trim(),
        checkerData: checker
          ? {
              userId: checker.userId,
              npp: checker.npp,
              fullName: checker.fullName,
            }
          : null,
        menuData: {
          menuId: rule.menu_id,
          menuName: 'USER_MANAGEMENT',
          menuAction: action === 'block' ? 'BLOCK_USER' : 'UNBLOCK_USER',
          actionFlow: rule.action_flow,
        },
        approverData: {},
      });
      if (!response.ok)
        throw new Error(
          response.message || 'Perubahan status belum dapat diproses.',
        );
      onSaved();
    });
  }
  return (
    <Dialog
      title={action === 'block' ? 'Blokir nasabah' : 'Buka blokir nasabah'}
      onClose={() => {
        if (!pending) onClose();
      }}
    >
      <p>
        Nasabah: <strong>{user.customerName}</strong>
      </p>
      {needsChecker && checkers.loading ? (
        <PageState loading />
      ) : checkers.error ? (
        <PageState
          title="Checker belum dapat dimuat"
          message={checkers.error}
          onRetry={checkers.refetch}
        />
      ) : (
        <form
          className="admin-detail-form"
          onSubmit={submit}
          aria-busy={pending}
        >
          {needsChecker && (
            <div className="form-field">
              <label htmlFor="checker">Checker</label>
              <select
                id="checker"
                value={checkerId}
                onChange={(event) => setCheckerId(event.target.value)}
                required
                disabled={pending}
              >
                <option value="">Pilih checker</option>
                {checkers.data.map((checker) => (
                  <option key={checker.userId} value={checker.userId}>
                    {checker.displayName || checker.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="form-field">
            <label htmlFor="reason">Alasan</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
              maxLength={500}
              rows={4}
              disabled={pending}
            />
          </div>
          {needsChecker && (
            <p className="field-help">
              Permintaan akan diteruskan untuk pemeriksaan dan persetujuan.
            </p>
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
