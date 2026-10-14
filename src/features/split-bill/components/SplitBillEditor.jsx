import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Dialog from '@/shared/components/Dialog.jsx';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction.js';
import { editSplitBill } from '@/features/split-bill/api/split-bill.api.js';
import { validateMembers } from '@/features/split-bill/lib/validation.js';
import { formatCurrency } from '@/shared/lib/format.js';

export default function SplitBillEditor({ bill, onClose, onSaved }) {
  const [members, setMembers] = useState(() =>
    bill.members.map((member) => ({
      ...member,
      key: member.member_id || crypto.randomUUID(),
    })),
  );
  const { pending, error, run } = useAsyncAction();
  function update(key, field, value) {
    setMembers((previous) =>
      previous.map((member) =>
        member.key === key ? { ...member, [field]: value } : member,
      ),
    );
  }
  function submit(event) {
    event.preventDefault();
    run(async () => {
      const message = validateMembers(members, bill.total_bill);
      if (message) throw new Error(message);
      await editSplitBill(bill.split_bill_id, bill, members);
      onSaved();
    });
  }
  return (
    <Dialog
      title="Ubah pembagian tagihan"
      onClose={() => {
        if (!pending) onClose();
      }}
    >
      <p>
        Total tagihan: <strong>{formatCurrency(bill.total_bill)}</strong>
      </p>
      <form className="split-form" onSubmit={submit} aria-busy={pending}>
        {members.map((member, index) => (
          <div className="split-participant" key={member.key}>
            <div className="form-field">
              <label htmlFor={`member-${member.key}`}>
                Peserta {index + 1}
              </label>
              <input
                id={`member-${member.key}`}
                required
                maxLength={100}
                value={member.member_name}
                disabled={pending || member.hasPaid}
                onChange={(event) =>
                  update(member.key, 'member_name', event.target.value)
                }
              />
            </div>
            <div className="form-field">
              <label htmlFor={`share-${member.key}`}>Nominal (Rp)</label>
              <input
                id={`share-${member.key}`}
                type="number"
                min="1"
                step="1"
                required
                value={member.amount}
                disabled={pending || member.hasPaid}
                onChange={(event) =>
                  update(member.key, 'amount', event.target.value)
                }
              />
            </div>
            <button
              type="button"
              className="icon-button"
              aria-label={`Hapus peserta ${index + 1}`}
              disabled={pending || member.hasPaid || members.length === 1}
              onClick={() =>
                setMembers((previous) =>
                  previous.filter((item) => item.key !== member.key),
                )
              }
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button-secondary"
          disabled={pending || members.length >= 100}
          onClick={() =>
            setMembers((previous) => [
              ...previous,
              {
                key: crypto.randomUUID(),
                member_id: null,
                member_name: '',
                amount: '',
                hasPaid: false,
              },
            ])
          }
        >
          <Plus size={16} /> Tambah peserta
        </button>
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
            {pending ? 'Menyimpan…' : 'Simpan perubahan'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
