import { api } from '@/shared/api/http.js';

export async function fetchAdminTransactionList(userId) {
  if (!userId) throw new Error('Pilih nasabah untuk melihat transaksi.');
  const { data } = await api.post('/api/admin/transaction/list', { userId });
  return { data, error: false };
}
