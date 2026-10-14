import { useNavigate } from 'react-router-dom';
import { UserRound, LogOut, ShieldCheck } from 'lucide-react';
import Navbar from '@/shared/components/Navbar.jsx';
import PageState from '@/shared/components/PageState.jsx';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource.js';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction.js';
import { getUserProfile } from '@/features/profile/api/profile.api.js';
import { postLogout } from '@/features/auth/api/auth.api.js';
import { clearSession } from '@/features/auth/lib/session.js';
import { formatDate } from '@/shared/lib/format.js';
import '@/features/profile/styles/profile.css';

export default function Profile() {
  const {
    data: profile,
    loading,
    error,
    refetch,
  } = useAsyncResource(getUserProfile);
  const { pending, run } = useAsyncAction();
  const navigate = useNavigate();
  function logout() {
    run(async () => {
      try {
        await postLogout();
      } finally {
        clearSession();
        navigate('/', { replace: true });
      }
    });
  }
  const fullName =
    profile &&
    [profile.firstName, profile.middleName, profile.lastName]
      .filter(Boolean)
      .join(' ');
  return (
    <div className="profile-page">
      <Navbar title="Profil" />
      <main className="profile-content">
        <header>
          <span className="eyebrow">AKUN ANDA</span>
          <h1>Profil & keamanan</h1>
          <p>Informasi pribadi yang terdaftar di Wandoor.</p>
        </header>
        {loading ? (
          <PageState loading />
        ) : error ? (
          <PageState
            title="Profil belum dapat dimuat"
            message={error}
            onRetry={refetch}
          />
        ) : (
          <div className="profile-layout">
            <section className="profile-identity">
              <span className="profile-avatar">
                <UserRound size={40} aria-hidden="true" />
              </span>
              <h2>{fullName || 'Nasabah Wandoor'}</h2>
              <p>CIF: {profile.cif || '—'}</p>
              <button
                type="button"
                className="button-secondary"
                onClick={logout}
                disabled={pending}
              >
                <LogOut size={16} aria-hidden="true" />{' '}
                {pending ? 'Keluar…' : 'Keluar dari akun'}
              </button>
            </section>
            <section
              className="profile-information"
              aria-labelledby="profile-information-title"
            >
              <h2 id="profile-information-title">Informasi pribadi</h2>
              <dl>
                {[
                  ['Nama lengkap', fullName],
                  ['Tanggal lahir', formatDate(profile.dob)],
                  ['Email', profile.emailAddress],
                  ['Nomor telepon', profile.phoneNumber],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value || '—'}</dd>
                  </div>
                ))}
              </dl>
              <p className="profile-safety">
                <ShieldCheck size={18} aria-hidden="true" /> Jaga kerahasiaan
                password dan OTP Anda.
              </p>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
