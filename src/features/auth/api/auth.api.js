import { api, getErrorMessage } from '@/shared/api/http.js';

async function authRequest(
  endpoint,
  payload,
  authenticated = false,
  sessionToken,
) {
  try {
    const response = await api.post(`/api/auth/${endpoint}`, payload, {
      requiresAuth: authenticated,
      sessionToken,
    });
    return {
      ok: response.data?.status !== false,
      data: response.data,
      message: response.data?.message,
    };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
}

export const postAuthLogin = ({ username, password }) =>
  authRequest('login', { username, password });
export const postVerifyOtp = ({ sessionID, otp_code }) =>
  authRequest('verify-otp', { sessionId: sessionID, otpCode: otp_code });
export const postResendOtp = ({ sessionID }) =>
  authRequest('resend-otp', { sessionId: sessionID });
export const postForgotPasswordRequestOtp = ({ username }) =>
  authRequest('forgot-password/request-otp', { username });
export const postForgotPasswordVerifyOtp = ({ sessionId, otpCode }) =>
  authRequest('forgot-password/verify-otp', { sessionId, otpCode });
export const postForgotPasswordReset = ({
  verifiedSession,
  newPassword,
  confirmPassword,
}) =>
  authRequest('forgot-password/reset-password', {
    verifiedSession,
    newPassword,
    confirmPassword,
  });
export const postLogout = (token) => authRequest('logout', {}, true, token);
