import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Bell, UserRound } from 'lucide-react';
import logo from '@/assets/images/wandoor-logo-2.png';
import NotificationPanel from '@/shared/components/NotificationPanel.jsx';
import '@/shared/styles/components/navbar.css';

const items = [
  { path: '/dashboard', label: 'Beranda' },
  { path: '/detailmycard', label: 'Rekening' },
  { path: '/lifegoals', label: 'Tujuan' },
  { path: '/splitbill', label: 'Split bill' },
];

export default function Navbar({ title }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationRef = useRef(null);
  useEffect(() => {
    if (!notificationsOpen) return;
    function outside(event) {
      if (!notificationRef.current?.contains(event.target))
        setNotificationsOpen(false);
    }
    function escape(event) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
        notificationRef.current?.querySelector('button')?.focus();
      }
    }
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [notificationsOpen]);
  return (
    <header className="navbar-container">
      <div className="navbar-content">
        <Link
          to="/dashboard"
          className="navbar-left"
          aria-label="Wandoor — beranda"
        >
          <img src={logo} alt="Wandoor" className="navbar-logo-img" />
        </Link>
        <nav className="navbar-links" aria-label="Navigasi utama">
          {items.map((item) => (
            <NavLink key={item.path} to={item.path}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="navbar-right">
          {title && <span className="navbar-section">{title}</span>}
          <div className="notification-anchor" ref={notificationRef}>
            <button
              type="button"
              className="icon-button"
              aria-label="Notifikasi"
              aria-expanded={notificationsOpen}
              aria-controls="notification-panel"
              onClick={() => setNotificationsOpen((value) => !value)}
            >
              <Bell size={19} />
            </button>
            {notificationsOpen && <NotificationPanel />}
          </div>
          <Link to="/profile" className="icon-button" aria-label="Profil akun">
            <UserRound size={19} />
          </Link>
        </div>
      </div>
    </header>
  );
}
