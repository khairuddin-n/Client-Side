import { useCallback, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Download, Pencil } from 'lucide-react';
import PageLayout from '@/shared/components/PageLayout.jsx';
import PageState from '@/shared/components/PageState.jsx';
import Dialog from '@/shared/components/Dialog.jsx';
import SplitBillEditor from '@/features/split-bill/components/SplitBillEditor.jsx';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource.js';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction.js';
import {
  getSplitBillById,
  markAsPaid,
} from '@/features/split-bill/api/split-bill.api.js';
import { formatCurrency, formatDate } from '@/shared/lib/format.js';

export default function SplitBillDetail() {
  const [params] = useSearchParams();
  const { state } = useLocation();
  const id = params.get('bill') || state?.splitBillId;
  const load = useCallback(() => getSplitBillById(id), [id]);
  const { data: bill, loading, error, refetch } = useAsyncResource(load);
  const [editing, setEditing] = useState(false);
  const [paying, setPaying] = useState(null);
  const { pending, error: actionError, run, setError } = useAsyncAction();
  function confirmPaid() {
    run(async () => {
      await markAsPaid(id, paying.member_id);
      setPaying(null);
      refetch();
    });
  }
  function download() {
    run(async () => {
      const { default: generateSplitBillPDF } =
        await import('@/features/split-bill/lib/generate-split-bill-pdf.js');
      generateSplitBillPDF(bill, bill.members).save('wandoor-split-bill.pdf');
    });
  }
  const progress =
    bill?.total_bill > 0
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              ((bill.total_bill - bill.remaining_bill) / bill.total_bill) * 100,
            ),
          ),
        )
      : 0;
  return (
    <PageLayout
      title={bill?.split_bill_title || 'Detail split bill'}
      description={
        bill
          ? `Dibuat ${formatDate(bill.created_time)}`
          : 'Pembagian tagihan bersama.'
      }
      actions={
        <Link to="/splitbill" className="button-secondary">
          ← Semua tagihan
        </Link>
      }
    >
      {loading ? (
        <PageState loading />
      ) : error ? (
        <PageState
          title="Detail belum dapat dimuat"
          message={error}
          onRetry={refetch}
        />
      ) : (
        <>
          <section className="product-summary">
            <div>
              <h2>Total tagihan</h2>
              <strong>{formatCurrency(bill.total_bill)}</strong>
              <p>
                {progress}% sudah dibayar · Sisa{' '}
                {formatCurrency(bill.remaining_bill)}
              </p>
            </div>
            <div className="dialog-actions">
              <button
                type="button"
                className="button-secondary"
                disabled={pending}
                onClick={() => {
                  setError('');
                  setEditing(true);
                }}
              >
                <Pencil size={16} /> Ubah
              </button>
              <button
                type="button"
                className="button-secondary"
                disabled={pending}
                onClick={download}
              >
                <Download size={16} /> PDF
              </button>
            </div>
          </section>
          {actionError && !paying && (
            <p className="form-error" role="alert">
              {actionError}
            </p>
          )}
          <section className="content-panel">
            <h2>Peserta tagihan</h2>
            <div className="table-responsive-wrapper">
              <table className="participant-table">
                <thead>
                  <tr>
                    <th scope="col">Peserta</th>
                    <th scope="col">Nominal</th>
                    <th scope="col">Status</th>
                    <th scope="col">Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {bill.members.map((member) => (
                    <tr key={member.member_id}>
                      <td>{member.member_name}</td>
                      <td>{formatCurrency(member.amount)}</td>
                      <td>{member.hasPaid ? 'Dibayar' : 'Belum dibayar'}</td>
                      <td>
                        {!member.hasPaid && (
                          <button
                            type="button"
                            className="button-secondary"
                            disabled={pending}
                            onClick={() => {
                              setError('');
                              setPaying(member);
                            }}
                          >
                            Tandai dibayar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          {editing && (
            <SplitBillEditor
              bill={bill}
              onClose={() => setEditing(false)}
              onSaved={() => {
                setEditing(false);
                refetch();
              }}
            />
          )}
          {paying && (
            <Dialog
              title="Konfirmasi pembayaran"
              onClose={() => {
                if (!pending) setPaying(null);
              }}
            >
              <p>
                Tandai pembayaran <strong>{paying.member_name}</strong> sebesar{' '}
                <strong>{formatCurrency(paying.amount)}</strong> sebagai
                dibayar?
              </p>
              {actionError && (
                <p className="form-error" role="alert">
                  {actionError}
                </p>
              )}
              <div className="dialog-actions">
                <button
                  type="button"
                  className="button-secondary"
                  disabled={pending}
                  onClick={() => setPaying(null)}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="button-primary"
                  disabled={pending}
                  onClick={confirmPaid}
                >
                  {pending ? 'Memproses…' : 'Konfirmasi'}
                </button>
              </div>
            </Dialog>
          )}
        </>
      )}
    </PageLayout>
  );
}
