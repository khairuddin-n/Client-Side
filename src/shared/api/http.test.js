import { AxiosError } from 'axios';
import { describe, expect, it, vi } from 'vitest';
import { createHttpClient } from '@/shared/api/http.js';
import { getSession, saveSession } from '@/features/auth/lib/session.js';
import { tokenFor } from '@/test/token.js';
import { api } from '@/shared/api/http.js';
import { postAuthLogin, postVerifyOtp } from '@/features/auth/api/auth.api.js';

describe('HTTP authentication', () => {
  it('attaches a valid bearer token to protected requests', async () => {
    const token = tokenFor();
    saveSession(token);
    const adapter = vi.fn(async (config) => ({
      data: {},
      status: 200,
      headers: {},
      config,
    }));
    await createHttpClient({ adapter }).get('/api/v1/profile');
    expect(adapter.mock.calls[0][0].headers.get('Authorization')).toBe(
      'Bearer ' + token,
    );
  });
  it('blocks expired sessions before any network request', async () => {
    sessionStorage.setItem('token', tokenFor({ exp: 1 }));
    const adapter = vi.fn();
    await expect(
      createHttpClient({ adapter }).get('/api/v1/profile'),
    ).rejects.toThrow('Sesi berakhir');
    expect(adapter).not.toHaveBeenCalled();
  });
  it('does not send a bearer token to public auth requests', async () => {
    saveSession(tokenFor());
    const adapter = vi.fn(async (config) => ({
      data: {},
      status: 200,
      headers: {},
      config,
    }));
    await createHttpClient({ adapter }).post(
      '/api/auth/login',
      {},
      { requiresAuth: false },
    );
    expect(adapter.mock.calls[0][0].headers.has('Authorization')).toBe(false);
  });
  it('invalidates the session on a protected 401 but preserves it on a public login rejection', async () => {
    const adapter = async (config) => {
      throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
        status: 401,
        data: {},
        headers: {},
        config,
      });
    };
    const client = createHttpClient({ adapter });
    saveSession(tokenFor());
    await expect(
      client.post('/api/auth/login', {}, { requiresAuth: false }),
    ).rejects.toThrow();
    expect(getSession()).not.toBeNull();
    await expect(client.get('/api/v1/profile')).rejects.toThrow();
    expect(getSession()).toBeNull();
  });
  it('prevents sending credentials to an absolute request URL', async () => {
    saveSession(tokenFor());
    const adapter = vi.fn();
    await expect(
      createHttpClient({ adapter }).get('https://example.com/api/profile'),
    ).rejects.toThrow('relative');
    expect(adapter).not.toHaveBeenCalled();
  });
  it('does not let a late 401 from an old session clear a new session', async () => {
    const first = tokenFor({ userId: 'first' });
    const second = tokenFor({ userId: 'second' });
    saveSession(first);
    const adapter = async (config) => {
      saveSession(second);
      throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
        status: 401,
        data: {},
        headers: {},
        config,
      });
    };
    await expect(
      createHttpClient({ adapter }).get('/api/v1/profile'),
    ).rejects.toThrow();
    expect(getSession()?.token).toBe(second);
  });
  it('can revoke a captured session using bearer auth after local logout', async () => {
    const token = tokenFor();
    const adapter = vi.fn(async (config) => ({
      data: {},
      status: 200,
      headers: {},
      config,
    }));
    await createHttpClient({ adapter }).post(
      '/api/auth/logout',
      {},
      { requiresAuth: true, sessionToken: token },
    );
    const config = adapter.mock.calls[0][0];
    expect(config.headers.get('Authorization')).toBe('Bearer ' + token);
    expect(config.auth).toBeUndefined();
  });
  it('does not grant development login or OTP when the server fails', async () => {
    vi.spyOn(api, 'post').mockRejectedValue(new Error('Network unavailable'));
    expect(
      await postAuthLogin({ username: 'admin', password: 'password' }),
    ).toMatchObject({ ok: false });
    expect(
      await postVerifyOtp({ sessionID: 'test-session', otp_code: '123456' }),
    ).toMatchObject({ ok: false });
  });
});
