import { api } from '@/shared/api/http.js';

export async function getPensionFunds() {
  const { data } = await api.get('/api/v1/dplk');
  if (!data?.data) throw new Error('Respons dana pensiun tidak valid.');
  return data;
}
