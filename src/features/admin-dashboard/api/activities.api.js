import { api, getErrorMessage } from '@/shared/api/http.js';

export async function fetchAdminActivityList() {
  const { data } = await api.get('/api/admin/activity/list');
  if (!Array.isArray(data.activityList))
    throw new Error('Respons aktivitas tidak valid.');
  return { data: { activityList: data.activityList }, error: false };
}

export async function fetchAdminActivityDetail(activityId) {
  if (!activityId) throw new Error('Aktivitas tidak ditemukan.');
  const { data } = await api.post('/api/admin/activity/detail', { activityId });
  return data;
}

export async function postAdminApproval(payload) {
  try {
    const { data } = await api.post('/api/admin/user/approval', payload);
    return { ok: data?.status !== false, data };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export async function fetchApproverList() {
  const { data } = await api.post('/api/admin/approver-list', {
    roleName: 'APPROVER',
  });
  return { ok: true, data: data?.data || [] };
}
