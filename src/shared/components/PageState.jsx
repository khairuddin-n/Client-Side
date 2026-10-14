import { AlertCircle, LoaderCircle, Inbox } from 'lucide-react';

export default function PageState({
  loading = false,
  title,
  message,
  onRetry,
  actionLabel = 'Coba lagi',
}) {
  const Icon = loading ? LoaderCircle : onRetry ? AlertCircle : Inbox;
  return (
    <section
      className="page-state"
      role={loading ? 'status' : onRetry ? 'alert' : 'status'}
      aria-live="polite"
    >
      <Icon size={32} className={loading ? 'spin' : ''} aria-hidden="true" />
      <h2>{title || (loading ? 'Memuat data…' : 'Belum ada data')}</h2>
      {message && <p>{message}</p>}
      {onRetry && (
        <button type="button" className="button-secondary" onClick={onRetry}>
          {actionLabel}
        </button>
      )}
    </section>
  );
}
