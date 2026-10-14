import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, LogOut, Menu } from 'lucide-react';
import logo from '@/assets/images/wandoor-logo-2.png';
import Dialog from '@/shared/components/Dialog.jsx';
import { useSession } from '@/features/auth/hooks/useSession.js';
import { clearSession } from '@/features/auth/lib/session.js';
import { postLogout } from '@/features/auth/api/auth.api.js';
import { useAsyncAction } from '@/shared/hooks/useAsyncAction.js';
import '@/shared/styles/components/page-layout.css';
import '@/features/admin-dashboard/styles/admin.css';

const items = [
  { path: '/admin/home', label: 'Ringkasan', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Nasabah', icon: Users },
  { path: '/admin/activity', label: 'Aktivitas', icon: Activity },
];

export default function AdminLayout({ title, description, children, actions }) {
  const [open, setOpen] = useState(false);
  const session = useSession();
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
  const navigation = (
    <nav className="admin-menu" aria-label="Navigasi admin">
      {items.map(({ path, label, icon: Icon }) => (
        <NavLink key={path} to={path} onClick={() => setOpen(false)}>
          <Icon size={18} aria-hidden="true" />
          {label}
        </NavLink>
      ))}
      <button
        type="button"
        className="admin-logout"
        onClick={logout}
        disabled={pending}
      >
        <LogOut size={18} aria-hidden="true" />
        {pending ? 'Keluar…' : 'Keluar'}
      </button>
    </nav>
  );
  return (
    <div className="admin-shell">
      <aside className="admin-rail">
        <Link to="/admin/home">
          <img src={logo} alt="Wandoor" />
        </Link>
        <span className="admin-workspace">ADMIN WORKSPACE</span>
        {navigation}
        <p className="admin-session-role">{session?.role}</p>
      </aside>
      <div className="admin-body">
        <header className="admin-topbar">
          <button
            type="button"
            className="icon-button admin-menu-toggle"
            aria-label="Buka navigasi admin"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>
          <span>Wandoor / Admin</span>
          <span className="admin-role-badge">{session?.role}</span>
        </header>
        <main className="admin-main">
          <header className="customer-heading">
            <div>
              <span className="eyebrow">ADMIN WORKSPACE</span>
              <h1>{title}</h1>
              {description && <p>{description}</p>}
            </div>
            {actions}
          </header>
          {children}
        </main>
      </div>
      {open && (
        <Dialog title="Navigasi admin" onClose={() => setOpen(false)}>
          {navigation}
        </Dialog>
      )}
    </div>
  );
}
