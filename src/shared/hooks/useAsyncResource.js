import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/shared/api/http.js';

export function useAsyncResource(load) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const refetch = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, loading: true, error: '' });
    Promise.resolve()
      .then(() => load(controller.signal))
      .then(
        (data) => {
          if (!controller.signal.aborted)
            setState({ data, loading: false, error: '' });
        },
        (error) => {
          if (!controller.signal.aborted)
            setState({
              data: null,
              loading: false,
              error: getErrorMessage(error),
            });
        },
      );
    return () => controller.abort();
  }, [load, revision]);
  return { ...state, refetch };
}
