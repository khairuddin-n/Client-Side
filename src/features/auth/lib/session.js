import { jwtDecode } from 'jwt-decode';

export const ADMIN_ROLES = ['ADMIN', 'MAKER', 'CHECKER', 'APPROVER'];
const ROLES = ['NASABAH', ...ADMIN_ROLES];
export const SESSION_EVENT = 'wandoor:session-change';
const SESSION_KEYS = [
  'token',
  'role',
  'sessionID',
  'userId',
  'user_id',
  'username',
  'cif',
  'npp',
  'email',
  'attempt',
  'menuAccess',
  'user_block_action_flow',
  'user_block_menu_id',
  'user_unblock_action_flow',
  'user_unblock_menu_id',
  'fp_session',
  'fp_verified',
  'fp_username_temp',
];

// Decoding is for UI routing only. The API must verify the JWT and authorize every operation.
export function readToken(token) {
  try {
    const claims = jwtDecode(token);
    if (
      !Number.isFinite(claims.exp) ||
      claims.exp * 1000 <= Date.now() ||
      !ROLES.includes(claims.role)
    )
      return null;
    return claims;
  } catch {
    return null;
  }
}

export function getSession() {
  const token = sessionStorage.getItem('token');
  const claims = token && readToken(token);
  return claims ? { ...claims, token } : null;
}

export function clearSession() {
  SESSION_KEYS.forEach((key) => sessionStorage.removeItem(key));
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function saveSession(token) {
  const claims = readToken(token);
  if (!claims)
    throw new Error(
      'Sesi tidak valid atau sudah kedaluwarsa. Silakan masuk kembali.',
    );
  clearSession();
  sessionStorage.setItem('token', token);
  for (const key of ['role', 'userId', 'username', 'cif', 'npp', 'email']) {
    if (claims[key] != null) sessionStorage.setItem(key, String(claims[key]));
  }
  if (claims.userId != null)
    sessionStorage.setItem('user_id', String(claims.userId));
  window.dispatchEvent(new Event(SESSION_EVENT));
  return claims;
}

export function sessionHome(session = getSession()) {
  return ADMIN_ROLES.includes(session?.role) ? '/admin/home' : '/dashboard';
}
