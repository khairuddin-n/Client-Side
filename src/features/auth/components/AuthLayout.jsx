import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';
import logo from '@/assets/images/wandoor-logo-2.png';
import '@/features/auth/styles/auth.css';

export default function AuthLayout({ title, description, children }) {
  return (
    <main className="auth-layout">
      <aside className="auth-brand">
        <Link to="/" className="auth-logo">
          <img src={logo} alt="Wandoor" />
        </Link>
        <div className="auth-brand-copy">
          <span className="eyebrow">WANDOOR • YOUR FINANCIAL SPACE</span>
          <h1>
            Keuangan lebih jelas.
            <br />
            Langkah lebih tenang.
          </h1>
          <p>
            Satu ruang untuk rekening, rencana masa depan, dan kebutuhan harian
            Anda.
          </p>
          <div className="auth-brand-mark" aria-hidden="true">
            <ArrowUpRight size={68} />
          </div>
        </div>
        <p className="auth-security">
          <ShieldCheck size={18} aria-hidden="true" /> Jangan bagikan password
          atau kode OTP Anda.
        </p>
      </aside>
      <section className="auth-form-panel" aria-labelledby="auth-title">
        <div className="auth-form-card">
          <span className="eyebrow">SELAMAT DATANG DI WANDOOR</span>
          <h2 id="auth-title">{title}</h2>
          <p className="auth-description">{description}</p>
          {children}
        </div>
        <footer className="auth-footer">
          Wandoor · Kelola hari ini, rencanakan esok.
        </footer>
      </section>
    </main>
  );
}
