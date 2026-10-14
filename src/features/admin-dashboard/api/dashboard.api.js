import { api } from '@/shared/api/http.js';

export async function fetchAdminDashboard() {
  const { data } = await api.get('/api/admin/transaction/summary');
  return { data, error: false };
}
