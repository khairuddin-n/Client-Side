import { describe, expect, it } from 'vitest';
import {
  clearSession,
  getSession,
  readToken,
  saveSession,
} from '@/features/auth/lib/session.js';
import { tokenFor } from '@/test/token.js';

describe('session validation', () => {
  it.each([
    'invalid',
    '',
    null,
    tokenFor({ exp: 1 }),
    tokenFor({ exp: undefined }),
    tokenFor({ role: 'UNKNOWN' }),
  ])('rejects malformed or unusable tokens: %s', (token) => {
    expect(readToken(token)).toBeNull();
  });
  it('uses claims from the token and stores supported user metadata', () => {
    saveSession(tokenFor({ role: 'CHECKER', userId: 'checker-1', npp: '123' }));
    expect(getSession()).toMatchObject({
      role: 'CHECKER',
      userId: 'checker-1',
    });
    expect(sessionStorage.getItem('user_id')).toBe('checker-1');
  });
  it('clears auth and reset data while preserving unrelated preferences', () => {
    sessionStorage.setItem('theme', 'light');
    sessionStorage.setItem('fp_verified', 'reset-session');
    saveSession(tokenFor());
    clearSession();
    expect(getSession()).toBeNull();
    expect(sessionStorage.getItem('fp_verified')).toBeNull();
    expect(sessionStorage.getItem('theme')).toBe('light');
  });
});
