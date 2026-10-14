import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  RefreshCw,
  Wallet,
  Landmark,
  Target,
  Sprout,
  ArrowRight,
} from 'lucide-react';
import Navbar from '@/shared/components/Navbar.jsx';
import PageState from '@/shared/components/PageState.jsx';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource.js';
import { fetchDashboard } from '@/features/dashboard/api/dashboard.api.js';
import { fetchAllCards } from '@/features/card/api/card.api.js';
import { formatCurrency, maskAccount } from '@/shared/lib/format.js';
import { useSession } from '@/features/auth/hooks/useSession.js';
import '@/features/dashboard/styles/dashboard.css';

async function loadDashboard() {
  const [dashboard, accounts] = await Promise.allSettled([
    fetchDashboard(),
    fetchAllCards(),
  ]);
  if (dashboard.status === 'rejected') throw dashboard.reason;
  return {
    overview: dashboard.value.data,
    accounts: accounts.status === 'fulfilled' ? accounts.value : [],
    accountsFailed: accounts.status === 'rejected',
  };
}

const products = [
  { key: 'accountSavings', label: 'Tabungan', path: '/savings', icon: Wallet },
  { key: 'timeDeposit', label: 'Deposito', path: '/deposits', icon: Landmark },
  { key: 'lifegoals', label: 'Life goals', path: '/lifegoals', icon: Target },
  { key: 'dplk', label: 'Dana pensiun', path: '/pensionfunds', icon: Sprout },
];

export default function Dashboard() {
  const { data, loading, error, refetch } = useAsyncResource(loadDashboard);
  const [visible, setVisible] = useState(false);
  const session = useSession();
  const money = (amount) => (visible ? formatCurrency(amount) : 'Rp ••••••');
  const overview = data?.overview;
  const totalBill = Number(overview?.splitBillOverview?.totalBillAmount ?? 0);
  const remaining = Number(
    overview?.splitBillOverview?.remainingBillAmount ?? 0,
  );
  const progress =
    totalBill > 0
      ? Math.min(
          100,
          Math.max(0, Math.round(((totalBill - remaining) / totalBill) * 100)),
        )
      : 0;
  return (
    <div className="overview-page">
      <Navbar />
      <main className="overview-main">
        <header className="overview-heading">
          <div>
            <span className="eyebrow">RINGKASAN KEUANGAN</span>
            <h1>Halo, {session?.username || 'nasabah'}.</h1>
            <p>Semua rencana Anda, dalam satu pandangan.</p>
          </div>
          <button
            type="button"
            className="button-secondary"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw size={16} aria-hidden="true" /> Perbarui
          </button>
        </header>
        {loading ? (
          <PageState loading />
        ) : error ? (
          <PageState
            title="Dashboard belum dapat dimuat"
            message={error}
            onRetry={refetch}
          />
        ) : (
          <>
            <section
              className="overview-summary"
              aria-label="Ringkasan saldo dan arus kas"
            >
              <article className="overview-assets">
                <div className="overview-card-heading">
                  <span>Total aset</span>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={
                      visible ? 'Sembunyikan saldo' : 'Tampilkan saldo'
                    }
                    aria-pressed={visible}
                    onClick={() => setVisible((value) => !value)}
                  >
                    {visible ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
                <strong className="overview-amount">
                  {money(overview.assetoverview?.totalAsset ?? 0)}
                </strong>
                <span className="overview-hint">
                  Saldo dari seluruh produk Anda
                </span>
              </article>
              <article className="overview-metric">
                <span className="metric-icon">
                  <ArrowDownLeft size={22} aria-hidden="true" />
                </span>
                <h2>Pemasukan</h2>
                <strong>
                  {money(overview.cashFlowOverview?.totalIncome ?? 0)}
                </strong>
                <p>Arus kas bulan ini</p>
              </article>
              <article className="overview-metric">
                <span className="metric-icon expense">
                  <ArrowUpRight size={22} aria-hidden="true" />
                </span>
                <h2>Pengeluaran</h2>
                <strong>
                  {money(overview.cashFlowOverview?.totalExpense ?? 0)}
                </strong>
                <p>Arus kas bulan ini</p>
              </article>
            </section>
            <section
              aria-labelledby="portfolio-title"
              className="overview-section"
            >
              <div className="section-heading">
                <h2 id="portfolio-title">Portofolio Anda</h2>
                <span>4 produk keuangan</span>
              </div>
              <div className="overview-products">
                {products.map(({ key, label, path, icon: Icon }) => (
                  <Link key={key} to={path} className="product-tile">
                    <span className="product-icon">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <h3>{label}</h3>
                    <strong>
                      {money(
                        overview.portfolioOverview?.find(
                          (product) => product.productName === key,
                        )?.totalAmount ?? 0,
                      )}
                    </strong>
                    <ArrowUpRight
                      className="product-arrow"
                      size={18}
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            </section>
            <section className="overview-bottom">
              <article className="overview-panel">
                <div className="section-heading">
                  <h2>Rekening Anda</h2>
                  <Link to="/detailmycard">
                    Lihat semua <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
                {data.accountsFailed ? (
                  <PageState
                    title="Rekening belum dapat dimuat"
                    onRetry={refetch}
                  />
                ) : data.accounts.length === 0 ? (
                  <PageState title="Belum ada rekening" />
                ) : (
                  <div className="account-list">
                    {data.accounts.slice(0, 3).map((account) => (
                      <Link
                        key={account.account_number}
                        to="/detailmycard"
                        state={{ selectedAccount: account.account_number }}
                        className="account-row"
                      >
                        <span className="account-icon">
                          <Wallet size={21} aria-hidden="true" />
                        </span>
                        <div>
                          <h3>{account.type}</h3>
                          <span>{maskAccount(account.account_number)}</span>
                        </div>
                        <strong>{money(account.effective_balance)}</strong>
                        <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                )}
              </article>
              <article className="overview-panel split-overview">
                <div className="section-heading">
                  <h2>Split bill</h2>
                  <span className="split-count">
                    {overview.splitBillOverview?.countSplitBill ?? 0} aktif
                  </span>
                </div>
                <p>Tagihan bersama, lebih mudah dipantau.</p>
                <strong className="split-amount">{money(remaining)}</strong>
                <span className="overview-hint">
                  Sisa tagihan yang belum dibayar
                </span>
                <progress
                  max="100"
                  value={progress}
                  aria-label="Persentase tagihan dibayar"
                />
                <span className="split-progress-label">
                  {progress}% sudah dibayar
                </span>
                <Link to="/splitbill" className="button-secondary">
                  Kelola split bill <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
