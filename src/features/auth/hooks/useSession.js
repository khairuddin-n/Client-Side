import { useMemo, useSyncExternalStore } from 'react';
import { getSession, SESSION_EVENT } from '@/features/auth/lib/session.js';

function subscribe(callback) {
  window.addEventListener(SESSION_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(SESSION_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export function useSession() {
  const token = useSyncExternalStore(
    subscribe,
    () => getSession()?.token ?? null,
    () => null,
  );
  return useMemo(() => (token ? getSession() : null), [token]);
}
