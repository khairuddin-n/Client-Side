import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '@/features/auth/components/AuthLayout.jsx';
import { postForgotPasswordRequestOtp } from '@/features/auth/api/auth.api.js';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction.js';

export default function ForgotPasswordRequest() {
  const [username, setUsername] = useState('');
  const { pending, error, run } = useAsyncAction();
  const navigate = useNavigate();
  function submit(event) {
    event.preventDefault();
    run(async () => {
      const response = await postForgotPasswordRequestOtp({
        username: username.trim(),
      });
      if (!response.ok || !response.data?.status || !response.data.sessionId)
        throw new Error(
          response.message || 'Permintaan reset belum dapat diproses.',
        );
      sessionStorage.removeItem('fp_verified');
      sessionStorage.setItem('fp_session', response.data.sessionId);
      sessionStorage.setItem('fp_username_temp', username.trim());
      navigate('/forgot/otp');
    });
  }
  return (
    <AuthLayout
      title="Lupa password?"
      description="Kami akan mengirim kode verifikasi ke email yang terdaftar."
    >
      <form className="auth-form" onSubmit={submit} aria-busy={pending}>
        <div className="form-field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            required
            maxLength={100}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={pending}
          />
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button-primary" disabled={pending}>
          {pending ? 'Mengirim…' : 'Kirim kode OTP'}
        </button>
        <Link to="/">← Kembali ke login</Link>
      </form>
    </AuthLayout>
  );
}
