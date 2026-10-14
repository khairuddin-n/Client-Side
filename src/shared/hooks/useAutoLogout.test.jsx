import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Swal from 'sweetalert2';
import useAutoLogout from '@/shared/hooks/useAutoLogout.js';
import { getSession, saveSession } from '@/features/auth/lib/session.js';
import { tokenFor } from '@/test/token.js';

vi.mock('@/features/auth/api/auth.api.js', () => ({
  postLogout: vi.fn(async () => ({ ok: true })),
}));

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn(() => new Promise(() => {})), close: vi.fn() },
}));

function Harness() {
  useAutoLogout();
  return <p>{useLocation().pathname}</p>;
}

describe('session deadlines', () => {
  it('clears authentication at the idle deadline without waiting for a modal confirmation', async () => {
    vi.useFakeTimers();
    saveSession(tokenFor());
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Harness />
      </MemoryRouter>,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300000);
    });
    expect(Swal.fire).toHaveBeenCalledOnce();
    expect(getSession()).toBeNull();
    expect(screen.getByText('/')).toBeInTheDocument();
  });
  it('expires a token even when the idle duration has not elapsed', async () => {
    vi.useFakeTimers();
    saveSession(tokenFor({ exp: Math.floor(Date.now() / 1000) + 10 }));
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Harness />
      </MemoryRouter>,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(11000);
    });
    expect(getSession()).toBeNull();
    expect(screen.getByText('/')).toBeInTheDocument();
  });
  it('does not start idle timers during anonymous password recovery', async () => {
    vi.useFakeTimers();
    render(
      <MemoryRouter initialEntries={['/forgot']}>
        <Harness />
      </MemoryRouter>,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300000);
    });
    expect(Swal.fire).not.toHaveBeenCalled();
    expect(screen.getByText('/forgot')).toBeInTheDocument();
  });
});
