import { api } from '@/shared/api/http.js';

export async function fetchLifeGoalsRevamp() {
  const response = await api.get('/api/v1/lifegoals');
  if (!response.data) throw new Error('Respons tujuan keuangan tidak valid.');
  return response;
}

export async function fetchLifeGoalDetail(accountNumber) {
  if (!accountNumber) throw new Error('Pilih rekening tujuan keuangan.');
  const response = await api.post('/api/v1/lifegoals-detail', {
    accountNumber,
  });
  if (!response.data)
    throw new Error('Respons detail tujuan keuangan tidak valid.');
  return response;
}
