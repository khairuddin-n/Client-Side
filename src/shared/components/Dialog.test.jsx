import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Dialog from '@/shared/components/Dialog.jsx';

describe('dialog access', () => {
  it('names the dialog, traps focus, handles Escape, and restores focus', () => {
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();
    const close = vi.fn();
    const { unmount } = render(
      <Dialog title="Konfirmasi" onClose={close}>
        <button>Terakhir</button>
      </Dialog>,
    );
    expect(
      screen.getByRole('dialog', { name: 'Konfirmasi' }),
    ).toBeInTheDocument();
    const first = screen.getByRole('button', { name: 'Tutup dialog' });
    const last = screen.getByRole('button', { name: 'Terakhir' });
    expect(first).toHaveFocus();
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(first).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(close).toHaveBeenCalledOnce();
    unmount();
    expect(opener).toHaveFocus();
    opener.remove();
  });
});
