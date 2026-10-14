// Unsigned test token for UI behavior only; never accepted by a real backend.
export function tokenFor(claims = {}) {
  const payload = {
    role: 'NASABAH',
    userId: 'test-user',
    username: 'Test User',
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...claims,
  };
  return `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify(payload))}.test-signature`;
}
