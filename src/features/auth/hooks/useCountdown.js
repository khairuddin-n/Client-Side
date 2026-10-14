import { useEffect, useState } from 'react';

export function useCountdown(initialSeconds = 30) {
  const [deadline, setDeadline] = useState(
    () => Date.now() + initialSeconds * 1000,
  );
  const [remaining, setRemaining] = useState(initialSeconds);
  useEffect(() => {
    const update = () =>
      setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);
  const restart = (seconds = 30) =>
    setDeadline(
      Date.now() +
        Math.max(0, Number.isFinite(Number(seconds)) ? Number(seconds) : 30) *
          1000,
    );
  return [remaining, restart];
}
