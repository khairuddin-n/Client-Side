import { api } from '@/shared/api/http.js';

export async function fetchAdminUserDetail(userId) {
  if (!userId) throw new Error('Nasabah tidak ditemukan.');
  const { data } = await api.post('/api/admin/detail-user', {
    targetUserId: userId,
  });
  return { data, error: false };
}
