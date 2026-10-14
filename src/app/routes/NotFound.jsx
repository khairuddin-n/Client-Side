import { Link } from 'react-router-dom';
import { sessionHome, getSession } from '@/features/auth/lib/session.js';
import PageState from '@/shared/components/PageState.jsx';

export default function NotFound() {
  return (
    <main className="not-found">
      <PageState
        title="Halaman tidak ditemukan"
        message="Alamat ini mungkin sudah berubah atau tidak tersedia."
      />
      <Link to={getSession() ? sessionHome() : '/'} className="button-primary">
        Kembali ke beranda
      </Link>
    </main>
  );
}
