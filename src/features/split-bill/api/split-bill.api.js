import { api } from '@/shared/api/http.js';

export function normalizeBill(bill) {
  if (!bill) return null;
  const members =
    bill.members ?? bill.billMembers ?? bill.splitBillMemberDetail ?? [];
  const result = {
    ...bill,
    split_bill_id: bill.split_bill_id ?? bill.splitBillId ?? bill.id,
    split_bill_title:
      bill.split_bill_title ??
      bill.splitBillTitle ??
      bill.title ??
      'Tanpa judul',
    total_bill: Number(
      bill.total_bill ?? bill.totalBill ?? bill.totalAmount ?? 0,
    ),
    ref_id: bill.ref_id ?? bill.refId ?? bill.transactionId,
    created_time: bill.created_time ?? bill.createdTime ?? bill.created_at,
    account_number: bill.account_number ?? bill.accountNumber,
    transaction_id: bill.transaction_id ?? bill.transactionId,
    members: members.map((member) => {
      const hasPaid =
        member.hasPaid === true || member.status?.toLowerCase() === 'paid';
      return {
        member_id: member.member_id ?? member.memberId ?? member.id ?? null,
        member_name:
          member.member_name ??
          member.memberName ??
          member.participantName ??
          '',
        amount: Number(
          member.amount ?? member.amountShare ?? member.totalBillAmount ?? 0,
        ),
        hasPaid,
        status: hasPaid ? 'Paid' : 'Unpaid',
        payment_time: member.paymentTime,
      };
    }),
  };
  result.remaining_bill = result.members
    .filter((member) => !member.hasPaid)
    .reduce((sum, member) => sum + member.amount, 0);
  return result;
}

export async function fetchSplitBills() {
  const { data } = await api.get('/api/v1/split-bill');
  if (!Array.isArray(data?.data))
    throw new Error('Respons split bill tidak valid.');
  return { status: true, data: data.data.map(normalizeBill) };
}

export async function getSplitBillById(splitBillId) {
  if (!splitBillId) throw new Error('Split bill tidak ditemukan.');
  const { data } = await api.post('/api/v1/split-bill/detail', { splitBillId });
  if (!data?.data) throw new Error('Detail split bill tidak ditemukan.');
  return normalizeBill(data.data);
}

export async function createSplitBill(payload) {
  const { data } = await api.post('/api/v1/split-bill/add', {
    accountNumber: payload.accountNumber,
    transactionId: payload.transactionId,
    splitBillTitle: payload.splitBillTitle,
    currency: payload.currency || 'IDR',
    totalAmount: payload.totalAmount,
    billMembers: payload.billMembers,
  });
  if (data?.status === false)
    throw new Error(data.message || 'Operasi split bill gagal.');
  return normalizeBill(data?.data || data);
}

export async function editSplitBill(splitBillId, bill, members) {
  const { data } = await api.post('/api/v1/split-bill/edit', {
    splitBillId,
    transactionId: bill.transaction_id,
    splitBillTitle: bill.split_bill_title,
    totalAmount: Number(bill.total_bill),
    billMembers: members.map((member) => ({
      memberId: member.member_id,
      memberName: member.member_name.trim(),
      amountShare: Number(member.amount),
      hasPaid: member.hasPaid,
    })),
  });
  if (data?.status === false)
    throw new Error(data.message || 'Operasi split bill gagal.');
  return normalizeBill(data?.data || data);
}

export async function markAsPaid(splitBillId, memberId) {
  const { data } = await api.post('/api/v1/split-bill/mark-paid', {
    splitBillId,
    memberId,
  });
  if (data?.status === false)
    throw new Error(data.message || 'Pembayaran belum dapat diperbarui.');
  return data;
}
