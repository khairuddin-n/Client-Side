import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from '@/features/auth/pages/Login.jsx';
import ForgotPasswordRequest from '@/features/auth/pages/ForgotPasswordRequest.jsx';
import ForgotPasswordOtp from '@/features/auth/pages/ForgotPasswordOtp.jsx';
import ForgotPasswordReset from '@/features/auth/pages/ForgotPasswordReset.jsx';
import {
  postAuthLogin,
  postForgotPasswordRequestOtp,
  postForgotPasswordVerifyOtp,
  postForgotPasswordReset,
} from '@/features/auth/api/auth.api.js';

vi.mock('@/features/auth/api/auth.api.js', () => ({
  postAuthLogin: vi.fn(),
  postVerifyOtp: vi.fn(),
  postResendOtp: vi.fn(),
  postForgotPasswordRequestOtp: vi.fn(),
  postForgotPasswordVerifyOtp: vi.fn(),
  postForgotPasswordReset: vi.fn(),
}));

function renderFlow(initial) {
  render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot" element={<ForgotPasswordRequest />} />
        <Route path="/forgot/otp" element={<ForgotPasswordOtp />} />
        <Route path="/forgot/reset" element={<ForgotPasswordReset />} />
        <Route path="/otpLogin" element={<p>Login OTP</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('authentication forms', () => {
  it('sends exact passwords and trimmed usernames, displays real server failures', async () => {
    postAuthLogin.mockResolvedValue({
      ok: false,
      message: 'Kredensial ditolak',
    });
    renderFlow('/');
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: ' customer ' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: ' pass with spaces ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Kredensial ditolak',
    );
    expect(postAuthLogin).toHaveBeenCalledWith({
      username: 'customer',
      password: ' pass with spaces ',
    });
    expect(sessionStorage.getItem('token')).toBeNull();
  });
  it('preserves the pending OTP session without granting authentication', async () => {
    postAuthLogin.mockResolvedValue({
      ok: true,
      data: {
        status: true,
        role: 'NASABAH',
        sessionIdOrToken: 'pending-login',
      },
    });
    renderFlow('/');
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'customer' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(await screen.findByText('Login OTP')).toBeInTheDocument();
    expect(sessionStorage.getItem('sessionID')).toBe('pending-login');
    expect(sessionStorage.getItem('token')).toBeNull();
  });
  it('runs password recovery using the same verified session through all steps', async () => {
    postForgotPasswordRequestOtp.mockResolvedValue({
      ok: true,
      data: { status: true, sessionId: 'reset-session' },
    });
    postForgotPasswordVerifyOtp.mockResolvedValue({
      ok: true,
      data: { status: true, verifiedSession: 'verified-reset' },
    });
    postForgotPasswordReset.mockResolvedValue({
      ok: true,
      data: { status: true },
    });
    renderFlow('/forgot');
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'customer' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Kirim kode OTP' }));
    const otp = await screen.findByLabelText('Kode OTP');
    fireEvent.change(otp, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Verifikasi' }));
    const password = await screen.findByLabelText('Password baru');
    expect(postForgotPasswordVerifyOtp).toHaveBeenCalledWith({
      sessionId: 'reset-session',
      otpCode: '123456',
    });
    fireEvent.change(password, { target: { value: 'NewPass1!' } });
    fireEvent.change(screen.getByLabelText('Konfirmasi password'), {
      target: { value: 'NewPass1!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan password' }));
    await waitFor(() =>
      expect(postForgotPasswordReset).toHaveBeenCalledWith({
        verifiedSession: 'verified-reset',
        newPassword: 'NewPass1!',
        confirmPassword: 'NewPass1!',
      }),
    );
    expect(
      await screen.findByRole('heading', { name: 'Password diperbarui' }),
    ).toBeInTheDocument();
    expect(sessionStorage.getItem('fp_verified')).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Kembali ke login' }),
    ).toHaveAttribute('href', '/');
  });
  it('prevents reaching a password reset without a verified session', () => {
    renderFlow('/forgot/reset');
    expect(
      screen.getByRole('heading', { name: 'Lupa password?' }),
    ).toBeInTheDocument();
  });
});
