import axios from 'axios';
import { getErrorMessage } from '@/shared/api/http.js';
import { useRef, useState } from 'react';

export function useAsyncAction() {
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function run(action) {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError('');
    try {
      return await action();
    } catch (failure) {
      setError(
        axios.isAxiosError(failure)
          ? getErrorMessage(failure)
          : failure?.message || 'Terjadi kesalahan. Silakan coba lagi.',
      );
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }
  return { pending, error, run, setError };
}
