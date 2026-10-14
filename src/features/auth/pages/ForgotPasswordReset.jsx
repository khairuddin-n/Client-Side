import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AuthLayout from '@/features/auth/components/AuthLayout.jsx';
import PasswordField from '@/features/auth/components/PasswordField.jsx';
import { postForgotPasswordReset } from '@/features/auth/api/auth.api.js';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction.js';

export default function ForgotPasswordReset() {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [complete, setComplete] = useState(false);
  const { pending, error, run } = useAsyncAction();
  const verifiedSession = sessionStorage.getItem('fp_verified');
  if (!verifiedSession && !complete) return <Navigate to="/forgot" replace />;
  const rules = [
    ['Minimal 8 karakter', password.length >= 8],
    [
      'Huruf besar dan huruf kecil',
      /[A-Z]/.test(password) && /[a-z]/.test(password),
    ],
    ['Minimal satu angka', /\d/.test(password)],
    ['Minimal satu simbol (@$!%*?&)', /[@$!%*?&]/.test(password)],
  ];
  function submit(event) {
    event.preventDefault();
    run(async () => {
      if (!rules.every(([, valid]) => valid))
        throw new Error('Password belum memenuhi persyaratan.');
      if (password !== confirmation)
        throw new Error('Konfirmasi password tidak sesuai.');
      const response = await postForgotPasswordReset({
        verifiedSession,
        newPassword: password,
        confirmPassword: confirmation,
      });
      if (!response.ok || !response.data?.status)
        throw new Error(response.message || 'Password belum dapat diperbarui.');
      ['fp_verified', 'fp_session', 'fp_username_temp'].forEach((key) =>
        sessionStorage.removeItem(key),
      );
      setPassword('');
      setConfirmation('');
      setComplete(true);
    });
  }
  return (
    <AuthLayout
      title={complete ? 'Password diperbarui' : 'Buat password baru'}
      description={
        complete
          ? 'Gunakan password baru Anda untuk masuk kembali.'
          : 'Pilih password yang kuat dan belum pernah Anda gunakan.'
      }
    >
      {complete ? (
        <Link to="/" className="button-primary">
          Kembali ke login
        </Link>
      ) : (
        <form className="auth-form" onSubmit={submit} aria-busy={pending}>
          <PasswordField
            id="new-password"
            label="Password baru"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={pending}
            aria-describedby="password-rules"
          />
          <ul id="password-rules" className="password-checklist">
            {rules.map(([label, valid]) => (
              <li key={label} className={valid ? 'valid' : ''}>
                {valid ? '✓' : '○'} {label}
              </li>
            ))}
          </ul>
          <PasswordField
            id="confirm-password"
            label="Konfirmasi password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            disabled={pending}
          />
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="button-primary" disabled={pending}>
            {pending ? 'Menyimpan…' : 'Simpan password'}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
