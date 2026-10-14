import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from '@/app/App.jsx';
import AuthRoute from '@/app/routes/AuthRoute.jsx';
import PrivateRoute from '@/app/routes/PrivateRoute.jsx';
import { saveSession } from '@/features/auth/lib/session.js';
import { tokenFor } from '@/test/token.js';

describe('application routing', () => {
  it('renders the actual login page for an anonymous user', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole('heading', { name: 'Masuk ke akun Anda' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'type',
      'password',
    );
  });
  it('renders a useful not-found page', async () => {
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <App />
      </MemoryRouter>,
    );
    expect(
      await screen.findByRole('heading', { name: 'Halaman tidak ditemukan' }),
    ).toBeInTheDocument();
  });
  it('rejects an expired token from a private route', () => {
    sessionStorage.setItem('token', tokenFor({ exp: 1 }));
    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/private" element={<p>Private content</p>} />
          </Route>
          <Route path="/" element={<p>Login page</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });
  it('routes an authenticated admin directly to the admin home', () => {
    saveSession(tokenFor({ role: 'MAKER' }));
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<AuthRoute />}>
            <Route path="/" element={<p>Login page</p>} />
          </Route>
          <Route path="/admin/home" element={<p>Admin home</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Admin home')).toBeInTheDocument();
  });
  it('does not let a customer access admin routes even if stored role is changed', () => {
    saveSession(tokenFor());
    sessionStorage.setItem('role', 'ADMIN');
    render(
      <MemoryRouter initialEntries={['/admin/users']}>
        <Routes>
          <Route element={<PrivateRoute admin />}>
            <Route path="/admin/users" element={<p>Admin users</p>} />
          </Route>
          <Route path="/dashboard" element={<p>Customer home</p>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('Customer home')).toBeInTheDocument();
    expect(screen.queryByText('Admin users')).not.toBeInTheDocument();
  });
});
