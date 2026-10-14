import { useCallback } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import PageLayout from '@/shared/components/PageLayout.jsx';
import PageState from '@/shared/components/PageState.jsx';
import StatementPanel from '@/shared/components/StatementPanel.jsx';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource.js';
import { fetchLifeGoalDetail } from '@/features/life-goals/api/life-goals.api.js';
import {
  formatDate,
  formatCurrency,
  maskAccount,
} from '@/shared/lib/format.js';

export default function LifeGoalsDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const load = useCallback(
    async () => (await fetchLifeGoalDetail(id)).data,
    [id],
  );
  const { data, loading, error, refetch } = useAsyncResource(load);
  return (
    <PageLayout
      title={state?.goal?.lifegoalsTitle || 'Detail life goal'}
      description="Lihat perkembangan simpanan dan detail rencana Anda."
      actions={
        <Link to="/lifegoals" className="button-secondary">
          ← Semua tujuan
        </Link>
      }
    >
      {loading ? (
        <PageState loading />
      ) : error ? (
        <PageState
          title="Detail belum dapat dimuat"
          message={error}
          onRetry={refetch}
        />
      ) : (
        <>
          <section className="content-panel" style={{ marginBottom: '1.5rem' }}>
            <h2>Informasi rencana</h2>
            <dl className="detail-list">
              {[
                ['Rekening', maskAccount(data.accountNumber)],
                [
                  'Estimasi akumulasi',
                  formatCurrency(data.estimatedAccumulateBalance),
                ],
                ['Setoran awal', formatCurrency(data.initialDeposit)],
                ['Suku bunga', `${data.interestRate ?? 0}%`],
                ['Durasi', `${data.lifegoalsDuration ?? 0} bulan`],
                ['Jatuh tempo', formatDate(data.maturityDate)],
                [
                  'Rekening pencairan',
                  maskAccount(
                    data.disbursmentAccountNumber ??
                      data.disbursementAccountNumber,
                  ),
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <StatementPanel accountNumber={id} productType="LFG" />
        </>
      )}
    </PageLayout>
  );
}
