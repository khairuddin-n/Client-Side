import { api } from '@/shared/api/http.js';

export async function fetchTransactions(payload, signal) {
  const { data } = await api.post('/api/v1/trx-history', payload, { signal });
  const transactions = data?.transaction ?? data?.transactions;
  if (!Array.isArray(transactions))
    throw new Error('Respons transaksi tidak valid.');
  return { transactions, transaction: transactions };
}
