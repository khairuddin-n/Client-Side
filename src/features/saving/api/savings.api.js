import { api } from '@/shared/api/http.js';

export async function getSavingsOverview() {
  const { data } = await api.post('/api/v1/savings', {});
  if (!data) throw new Error('Respons tabungan tidak valid.');
  return data;
}

export async function getSavingsDetail() {
  const { data } = await api.post('/api/v1/savings/detail', {});
  if (!data?.summary) throw new Error('Respons detail tabungan tidak valid.');
  return data;
}
