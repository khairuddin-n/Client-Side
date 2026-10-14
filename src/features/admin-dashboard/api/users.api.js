import { api, getErrorMessage } from '@/shared/api/http.js';

export async function fetchAdminUsers() {
  const { data } = await api.get('/api/admin/users-list');
  return { data, error: false };
}

export async function fetchMenuAccess() {
  const { data } = await api.get('/api/admin/menu-access');
  return { data, error: false };
}

async function changeUserStatus(action, payload) {
  try {
    const { data } = await api.post(`/api/admin/user/${action}`, payload);
    return { ok: data?.status !== false, data };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export const fetchAdminBlock = (payload) => changeUserStatus('block', payload);
export const fetchAdminUnBlock = (payload) =>
  changeUserStatus('unblock', payload);

export async function fetchApproverList(roleName = 'CHECKER') {
  const { data } = await api.post('/api/admin/approver-list', { roleName });
  return data?.data || [];
}
