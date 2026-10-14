import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '@/features/auth/components/AuthLayout.jsx';
import PasswordField from '@/features/auth/components/PasswordField.jsx';
import { postAuthLogin } from '@/features/auth/api/auth.api.js';
import {
  ADMIN_ROLES,
  clearSession,
  saveSession,
  sessionHome,
} from '@/features/auth/lib/session.js';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction.js';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { pending, error, run } = useAsyncAction();
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    run(async () => {
      const response = await postAuthLogin({
        username: username.trim(),
        password,
      });
      if (!response.ok || !response.data?.status)
        throw new Error(
          response.message || 'Username atau password tidak sesuai.',
        );
      const { role, sessionIdOrToken } = response.data;
      if (!sessionIdOrToken) throw new Error('Respons sesi tidak valid.');
      if (role === 'NASABAH') {
        clearSession();
        sessionStorage.setItem('sessionID', sessionIdOrToken);
        navigate('/otpLogin', { replace: true });
        return;
      }
      if (!ADMIN_ROLES.includes(role))
        throw new Error('Peran sesi tidak valid.');
      const claims = saveSession(sessionIdOrToken);
      navigate(sessionHome(claims), { replace: true });
    });
  };

  return (
    <AuthLayout
      title="Masuk ke akun Anda"
      description="Pantau keuangan dan lanjutkan rencana Anda dengan aman."
    >
      <form onSubmit={handleSubmit} className="auth-form" aria-busy={pending}>
        <div className="form-field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            maxLength={100}
            placeholder="Masukkan username"
            disabled={pending}
          />
        </div>
        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={pending}
          placeholder="Masukkan password"
        />
        <Link to="/forgot" className="auth-forgot-link">
          Lupa password?
        </Link>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button-primary" disabled={pending}>
          {pending ? 'Memproses…' : 'Masuk'}
        </button>
      </form>
      <p className="auth-note">
        Kode OTP hanya dikirim ke email yang terdaftar.
      </p>
    </AuthLayout>
  );
}
