import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useSession } from '@/features/auth/hooks/useSession.js';
import { postLogout } from '@/features/auth/api/auth.api.js';
import { clearSession } from '@/features/auth/lib/session.js';

export default function useAutoLogout(timeoutMinutes = 5, warningSeconds = 30) {
  const session = useSession();
  const navigate = useNavigate();
  const token = session?.token;
  const expiresAt = session?.exp;
  useEffect(() => {
    if (!token) return;
    let idleTimer;
    let warningTimer;
    let expiryTimer;
    let active = true;
    let warningOpen = false;
    let warningVersion = 0;
    const timeout = timeoutMinutes * 60_000;
    function closeWarning() {
      warningVersion += 1;
      if (warningOpen) {
        warningOpen = false;
        Swal.close();
      }
    }
    function logout() {
      if (!active) return;
      active = false;
      closeWarning();
      clearTimeout(idleTimer);
      clearTimeout(warningTimer);
      clearTimeout(expiryTimer);
      void postLogout(token);
      clearSession();
      navigate('/', { replace: true });
    }
    function reset() {
      if (!active || warningOpen) return;
      clearTimeout(idleTimer);
      clearTimeout(warningTimer);
      warningTimer = setTimeout(
        async () => {
          warningOpen = true;
          const version = ++warningVersion;
          const result = await Swal.fire({
            icon: 'info',
            title: 'Sesi hampir berakhir',
            text: `Anda tidak aktif. Sesi akan berakhir dalam ${warningSeconds} detik.`,
            confirmButtonText: 'Tetap masuk',
            cancelButtonText: 'Keluar',
            showCancelButton: true,
            allowOutsideClick: false,
            timer: warningSeconds * 1000,
            timerProgressBar: true,
          });
          if (!active || version !== warningVersion) return;
          warningOpen = false;
          if (result.isConfirmed) reset();
          else logout();
        },
        Math.max(0, timeout - warningSeconds * 1000),
      );
      idleTimer = setTimeout(logout, timeout);
    }
    const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) =>
      window.addEventListener(event, reset, { passive: true }),
    );
    const checkExpiry = () => {
      const remaining = expiresAt * 1000 - Date.now();
      if (remaining <= 0) logout();
      else
        expiryTimer = setTimeout(
          checkExpiry,
          Math.min(remaining, 2_147_483_647),
        );
    };
    reset();
    checkExpiry();
    return () => {
      active = false;
      closeWarning();
      events.forEach((event) => window.removeEventListener(event, reset));
      clearTimeout(idleTimer);
      clearTimeout(warningTimer);
      clearTimeout(expiryTimer);
    };
  }, [token, expiresAt, navigate, timeoutMinutes, warningSeconds]);
}
