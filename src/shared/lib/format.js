const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatCurrency(value) {
  const amount = Number(value);
  return rupiah.format(Number.isFinite(amount) ? amount : 0);
}

export function maskAccount(value) {
  const account = String(value ?? '');
  return account ? `•••• ${account.slice(-4)}` : '—';
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(date);
}

export function lastTwelveMonths(now = new Date()) {
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
    return {
      label: date.toLocaleString('id-ID', { month: 'short' }),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    };
  });
}
