import { api } from '@/shared/api/http.js';

export async function getTimeDeposits() {
  const { data } = await api.get('/api/v1/detail-deposit');
  if (!data?.status)
    throw new Error(data?.message || 'Tidak dapat memuat deposito.');
  return data;
}
