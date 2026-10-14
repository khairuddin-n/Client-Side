import { useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import PageLayout from '@/shared/components/PageLayout.jsx';
import PageState from '@/shared/components/PageState.jsx';
import StatementPanel from '@/shared/components/StatementPanel.jsx';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource.js';
import { formatCurrency, maskAccount } from '@/shared/lib/format.js';

export default function AccountPortfolio({
  title,
  description,
  load,
  productType = 'SVG',
  children,
}) {
  const resource = useAsyncResource(load);
  const [params, setParams] = useSearchParams();
  const { state } = useLocation();
  const [visible, setVisible] = useState(false);
  const accounts = resource.data?.accounts || [];
  const requested = params.get('account') || state?.selectedAccount;
  const selected =
    accounts.find((account) => account.accountNumber === requested) ||
    accounts[0];
  const money = (value) => (visible ? formatCurrency(value) : 'Rp ••••••');
  return (
    <PageLayout
      title={title}
      description={description}
      eyebrow="PORTOFOLIO ANDA"
      actions={
        <button
          type="button"
          className="button-secondary"
          onClick={resource.refetch}
          disabled={resource.loading}
        >
          <RefreshCw size={16} /> Perbarui
        </button>
      }
    >
      {resource.loading ? (
        <PageState loading />
      ) : resource.error ? (
        <PageState
          title="Data belum dapat dimuat"
          message={resource.error}
          onRetry={resource.refetch}
        />
      ) : (
        <>
          <section className="product-summary">
            <div>
              <h2>Total saldo</h2>
              <strong>{money(resource.data.totalBalance)}</strong>
              <p>{accounts.length} rekening terdaftar</p>
            </div>
            <button
              type="button"
              className="icon-button"
              aria-label={visible ? 'Sembunyikan saldo' : 'Tampilkan saldo'}
              aria-pressed={visible}
              onClick={() => setVisible((value) => !value)}
            >
              {visible ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </section>
          {accounts.length === 0 ? (
            <PageState
              title="Belum ada rekening"
              message="Rekening yang terdaftar akan ditampilkan di sini."
            />
          ) : (
            <>
              <div className="product-account-list" aria-label="Pilih rekening">
                {accounts.map((account) => (
                  <button
                    type="button"
                    className="product-account-card"
                    key={account.accountNumber}
                    aria-pressed={
                      selected?.accountNumber === account.accountNumber
                    }
                    onClick={() =>
                      setParams(
                        { account: account.accountNumber },
                        { replace: true },
                      )
                    }
                  >
                    <h2>{account.title}</h2>
                    <p>
                      {visible
                        ? account.accountNumber
                        : maskAccount(account.accountNumber)}
                    </p>
                    <strong>{money(account.balance)}</strong>
                    {account.details && (
                      <dl>
                        {account.details.map(([label, value]) => (
                          <div key={label}>
                            <dt>{label}</dt>
                            <dd>{value || '—'}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                  </button>
                ))}
              </div>
              {children?.(resource.data)}
              <StatementPanel
                accountNumber={selected?.accountNumber}
                productType={productType}
              />
            </>
          )}
        </>
      )}
    </PageLayout>
  );
}
