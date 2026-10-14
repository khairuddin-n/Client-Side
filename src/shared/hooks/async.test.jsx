import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource.js';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction.js';

describe('async request ownership', () => {
  it('ignores responses belonging to an earlier resource', async () => {
    let resolveOld;
    const oldLoad = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveOld = resolve;
        }),
    );
    const newLoad = vi.fn(async () => 'new response');
    const { result, rerender } = renderHook(
      ({ load }) => useAsyncResource(load),
      { initialProps: { load: oldLoad } },
    );
    await waitFor(() => expect(oldLoad).toHaveBeenCalled());
    rerender({ load: newLoad });
    await waitFor(() => expect(result.current.data).toBe('new response'));
    await act(async () => {
      resolveOld('stale response');
    });
    expect(result.current.data).toBe('new response');
  });
  it('prevents overlapping submissions', async () => {
    let resolve;
    const action = vi.fn(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const { result } = renderHook(useAsyncAction);
    let running;
    act(() => {
      running = result.current.run(action);
      result.current.run(action);
    });
    expect(action).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolve('done');
      await running;
    });
    expect(result.current.pending).toBe(false);
  });
});
