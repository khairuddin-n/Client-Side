import axios from 'axios';
import {
  clearSession,
  getSession,
  readToken,
} from '@/features/auth/lib/session.js';

export function getErrorMessage(error) {
  const message = error?.response?.data?.message;
  if (typeof message === 'string' && message.length <= 500) return message;
  if (error?.code === 'ECONNABORTED')
    return 'Permintaan terlalu lama. Silakan coba lagi.';
  if (!error?.response)
    return 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
  return 'Permintaan tidak dapat diproses. Silakan coba lagi.';
}

export function createHttpClient(options = {}) {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: 15000,
    headers: { Accept: 'application/json' },
    ...options,
  });
  client.interceptors.request.use((config) => {
    if (!config.url?.startsWith('/api/')) {
      throw new Error('API requests must use a relative /api/ endpoint.');
    }
    if (config.requiresAuth !== false) {
      const token = config.sessionToken || getSession()?.token;
      if (!token || !readToken(token)) {
        if (!config.sessionToken) clearSession();
        throw new Error('Sesi berakhir. Silakan masuk kembali.');
      }
      config._sessionToken = token;
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers.delete('Authorization');
    }
    return config;
  });
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error?.response?.status === 401 &&
        error.config?.requiresAuth !== false &&
        sessionStorage.getItem('token') === error.config?._sessionToken
      )
        clearSession();
      return Promise.reject(error);
    },
  );
  return client;
}

export const api = createHttpClient();
