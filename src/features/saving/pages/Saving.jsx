import AccountPortfolio from '@/shared/components/AccountPortfolio.jsx';
import {
  getSavingsOverview,
  getSavingsDetail,
} from '@/features/saving/api/savings.api.js';
import { formatCurrency } from '@/shared/lib/format.js';

async function loadSavings() {
  const [overview, detail] = await Promise.all([
    getSavingsOverview(),
    getSavingsDetail(),
  ]);
  return {
    totalBalance: overview.targetAccountDetail?.Total_EffectiveBalance ?? 0,
    accounts: (overview.accountList || []).map((account) => ({
      accountNumber: account.account_number,
      title: account.product_name || 'Tabungan',
      balance: account.effective_balance_total,
      details: [
        ['Pemilik', account.account_name],
        ['Status', account.account_status],
      ],
    })),
    detail,
  };
}

export default function Saving() {
  return (
    <AccountPortfolio
      title="Tabungan"
      description="Ringkasan saldo, arus kas, dan kebiasaan pengeluaran Anda."
      load={loadSavings}
    >
      {({ detail }) => (
        <section className="content-panel" style={{ marginBottom: '1.5rem' }}>
          <h2>Kategori pengeluaran</h2>
          {detail.category_breakdown?.length ? (
            <ul className="category-list">
              {detail.category_breakdown.map((category) => (
                <li key={category.category}>
                  <span>{category.category}</span>
                  <strong>
                    {formatCurrency(category.total_amount)} · {category.percent}
                    %
                  </strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>Belum ada pengeluaran untuk ditampilkan.</p>
          )}
        </section>
      )}
    </AccountPortfolio>
  );
}
