import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import PageLayout from '@/shared/components/PageLayout.jsx';
import PageState from '@/shared/components/PageState.jsx';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource.js';
import { fetchSplitBills } from '@/features/split-bill/api/split-bill.api.js';
import { formatCurrency, formatDate } from '@/shared/lib/format.js';

async function loadBills() {
  return (await fetchSplitBills()).data;
}

export default function SplitBill() {
  const { data: bills, loading, error, refetch } = useAsyncResource(loadBills);
  return (
    <PageLayout
      title="Split bill"
      description="Pantau tagihan bersama dan status pembayaran setiap peserta."
      eyebrow="TAGIHAN BERSAMA"
      actions={
        <button
          type="button"
          className="button-secondary"
          onClick={refetch}
          disabled={loading}
        >
          <RefreshCw size={16} /> Perbarui
        </button>
      }
    >
      {loading ? (
        <PageState loading />
      ) : error ? (
        <PageState
          title="Split bill belum dapat dimuat"
          message={error}
          onRetry={refetch}
        />
      ) : !bills?.length ? (
        <PageState
          title="Belum ada split bill"
          message="Buat tagihan bersama dari transaksi pengeluaran di halaman rekening."
        />
      ) : (
        <div className="product-account-list">
          {bills.map((bill) => {
            const progress =
              bill.total_bill > 0
                ? Math.max(
                    0,
                    Math.min(
                      100,
                      Math.round(
                        ((bill.total_bill - bill.remaining_bill) /
                          bill.total_bill) *
                          100,
                      ),
                    ),
                  )
                : 0;
            return (
              <Link
                className="product-account-card"
                key={bill.split_bill_id}
                to={
                  '/splitbill/detail?bill=' +
                  encodeURIComponent(bill.split_bill_id)
                }
              >
                <h2>{bill.split_bill_title}</h2>
                <p>{formatDate(bill.created_time)}</p>
                <strong>{formatCurrency(bill.total_bill)}</strong>
                <progress
                  className="goal-progress"
                  max={100}
                  value={progress}
                  aria-label={`Pembayaran ${bill.split_bill_title}`}
                />
                <p>
                  {progress}% dibayar · Sisa{' '}
                  {formatCurrency(bill.remaining_bill)}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
}
