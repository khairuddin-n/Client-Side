import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '@/features/auth/components/AuthLayout.jsx';
import { useCountdown } from '@/features/auth/hooks/useCountdown.js';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction.js';
import { saveSession, sessionHome } from '@/features/auth/lib/session.js';
import {
  postVerifyOtp,
  postResendOtp,
  postForgotPasswordVerifyOtp,
  postForgotPasswordRequestOtp,
} from '@/features/auth/api/auth.api.js';

export default function OtpVerification({ resetPassword = false }) {
  const [code, setCode] = useState('');
  const [notice, setNotice] = useState('');
  const [remaining, restart] = useCountdown();
  const { pending, error, run } = useAsyncAction();
  const navigate = useNavigate();
  const sessionKey = resetPassword ? 'fp_session' : 'sessionID';
  const sessionId = sessionStorage.getItem(sessionKey);
  if (!sessionId)
    return <Navigate to={resetPassword ? '/forgot' : '/'} replace />;

  function verify(event) {
    event.preventDefault();
    run(async () => {
      if (!/^\d{6}$/.test(code)) throw new Error('Masukkan kode OTP 6 digit.');
      const response = resetPassword
        ? await postForgotPasswordVerifyOtp({ sessionId, otpCode: code })
        : await postVerifyOtp({ sessionID: sessionId, otp_code: code });
      if (!response.ok || !response.data?.status)
        throw new Error(response.message || 'Kode OTP tidak sesuai.');
      if (resetPassword) {
        if (!response.data.verifiedSession)
          throw new Error('Sesi verifikasi tidak valid.');
        sessionStorage.setItem('fp_verified', response.data.verifiedSession);
        navigate('/forgot/reset', { replace: true });
      } else {
        const claims = saveSession(response.data.token);
        navigate(sessionHome(claims), { replace: true });
      }
    });
  }

  function resend() {
    if (remaining > 0) return;
    run(async () => {
      const username = sessionStorage.getItem('fp_username_temp');
      if (resetPassword && !username)
        throw new Error('Sesi berakhir. Ulangi permintaan reset password.');
      const response = resetPassword
        ? await postForgotPasswordRequestOtp({ username })
        : await postResendOtp({ sessionID: sessionId });
      if (!response.ok || response.data?.status === false)
        throw new Error(response.message || 'Kode OTP belum dapat dikirim.');
      if (resetPassword) {
        if (!response.data.sessionId)
          throw new Error('Respons sesi tidak valid.');
        sessionStorage.setItem('fp_session', response.data.sessionId);
      }
      setCode('');
      restart(response.data?.resendCooldown ?? 30);
      setNotice('Kode OTP baru telah dikirim ke email Anda.');
    });
  }

  return (
    <AuthLayout
      title="Verifikasi kode OTP"
      description="Masukkan 6 digit kode yang dikirim ke email terdaftar."
    >
      <form onSubmit={verify} className="auth-form" aria-busy={pending}>
        <div className="form-field">
          <label htmlFor="otp">Kode OTP</label>
          <input
            id="otp"
            name="otp"
            className="otp-code-input"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
            }
            placeholder="000000"
            required
            disabled={pending}
            aria-describedby="otp-help"
          />
          <p id="otp-help" className="field-help">
            Kode ini bersifat rahasia. Jangan bagikan kepada siapa pun.
          </p>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="form-notice" role="status">
            {notice}
          </p>
        )}
        <button
          type="submit"
          className="button-primary"
          disabled={pending || code.length !== 6}
        >
          {pending ? 'Memproses…' : 'Verifikasi'}
        </button>
        <button
          type="button"
          className="button-secondary"
          onClick={resend}
          disabled={pending || remaining > 0}
        >
          {remaining > 0
            ? `Kirim ulang dalam ${remaining} detik`
            : 'Kirim ulang OTP'}
        </button>
        <Link to={resetPassword ? '/forgot' : '/'}>← Kembali</Link>
      </form>
    </AuthLayout>
  );
}
