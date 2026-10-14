import { Link } from 'react-router-dom';
import AuthLayout from '@/features/auth/components/AuthLayout.jsx';

export default function Blocked() {
  return (
    <AuthLayout
      title="Akun diblokir sementara"
      description="Terlalu banyak percobaan verifikasi. Silakan coba kembali nanti atau hubungi pengelola Wandoor."
    >
      <Link to="/" className="button-primary">
        Kembali ke login
      </Link>
    </AuthLayout>
  );
}
