import { api } from '@/shared/api/http.js';

export async function getUserProfile() {
  const { data } = await api.get('/api/v1/profile');
  if (!data?.status || !data?.data)
    throw new Error('Respons profil tidak valid.');
  return data.data;
}
