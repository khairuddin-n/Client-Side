import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Dialog from '@/shared/components/Dialog.jsx';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction.js';
import { createSplitBill } from '@/features/split-bill/api/split-bill.api.js';
import { validateMembers } from '@/features/split-bill/lib/validation.js';
import { formatCurrency } from '@/shared/lib/format.js';

const member = () => ({
  key: crypto.randomUUID(),
  member_name: '',
  amount: '',
});

export default function SplitBillForm({ onClose, onSuccess, transaction }) {
  const [participants, setParticipants] = useState(() => [member()]);
  const { pending, error, run } = useAsyncAction();
  const total = Math.abs(Number(transaction?.amount) || 0);
  const remaining =
    total -
    participants.reduce(
      (sum, participant) => sum + Number(participant.amount || 0),
      0,
    );
  function update(key, field, value) {
    setParticipants((previous) =>
      previous.map((participant) =>
        participant.key === key
          ? { ...participant, [field]: value }
          : participant,
      ),
    );
  }
  function submit(event) {
    event.preventDefault();
    run(async () => {
      const message = validateMembers(participants, total);
      if (message) throw new Error(message);
      if (!transaction.accountNumber || !transaction.transactionId)
        throw new Error('Data transaksi tidak lengkap.');
      const result = await createSplitBill({
        accountNumber: transaction.accountNumber,
        transactionId: transaction.transactionId,
        splitBillTitle: transaction.detail || transaction.type || 'Split bill',
        totalAmount: total,
        billMembers: participants.map((participant) => ({
          memberName: participant.member_name.trim(),
          amountShare: Number(participant.amount),
        })),
      });
      if (!result?.split_bill_id)
        throw new Error(
          'Server belum mengembalikan ID split bill. Periksa daftar tagihan sebelum mencoba kembali.',
        );
      onSuccess?.(result.split_bill_id);
    });
  }
  return (
    <Dialog
      title="Bagi tagihan"
      onClose={() => {
        if (!pending) onClose();
      }}
    >
      <p className="dialog-description">
        {transaction.detail || transaction.type}
      </p>
      <strong className="dialog-amount">{formatCurrency(total)}</strong>
      <form className="split-form" onSubmit={submit} aria-busy={pending}>
        {participants.map((participant, index) => (
          <div className="split-participant" key={participant.key}>
            <div className="form-field">
              <label htmlFor={`name-${participant.key}`}>
                Peserta {index + 1}
              </label>
              <input
                id={`name-${participant.key}`}
                value={participant.member_name}
                required
                maxLength={100}
                onChange={(event) =>
                  update(participant.key, 'member_name', event.target.value)
                }
                disabled={pending}
              />
            </div>
            <div className="form-field">
              <label htmlFor={`amount-${participant.key}`}>Nominal (Rp)</label>
              <input
                id={`amount-${participant.key}`}
                type="number"
                min="1"
                step="1"
                value={participant.amount}
                required
                onChange={(event) =>
                  update(participant.key, 'amount', event.target.value)
                }
                disabled={pending}
              />
            </div>
            <button
              type="button"
              className="icon-button"
              aria-label={`Hapus peserta ${index + 1}`}
              disabled={pending || participants.length === 1}
              onClick={() =>
                setParticipants((previous) =>
                  previous.filter((item) => item.key !== participant.key),
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
          disabled={pending || participants.length >= 100}
          onClick={() => setParticipants((previous) => [...previous, member()])}
        >
          <Plus size={16} /> Tambah peserta
        </button>
        <p className="split-remaining">
          Sisa pembagian: <strong>{formatCurrency(remaining)}</strong>
        </p>
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
            {pending ? 'Menyimpan…' : 'Simpan split bill'}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
