import { api } from '@/shared/api/http.js';

export async function fetchDashboard() {
  const response = await api.get('/api/v1/fetch-dashboard');
  if (!response.data) throw new Error('Respons dashboard tidak valid.');
  return response;
}
