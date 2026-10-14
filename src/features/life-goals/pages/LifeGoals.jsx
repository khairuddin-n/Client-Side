import { Link } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import PageLayout from '@/shared/components/PageLayout.jsx';
import PageState from '@/shared/components/PageState.jsx';
import { useAsyncResource } from '@/shared/hooks/useAsyncResource.js';
import { fetchLifeGoalsRevamp } from '@/features/life-goals/api/life-goals.api.js';
import { formatCurrency } from '@/shared/lib/format.js';

async function loadGoals() {
  return (await fetchLifeGoalsRevamp()).data;
}

export default function LifeGoals() {
  const { data, loading, error, refetch } = useAsyncResource(loadGoals);
  const groups = Object.entries(data || {});
  return (
    <PageLayout
      title="Life goals"
      description="Langkah kecil hari ini untuk rencana besar Anda."
      eyebrow="RENCANA MASA DEPAN"
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
          title="Life goals belum dapat dimuat"
          message={error}
          onRetry={refetch}
        />
      ) : groups.length === 0 ? (
        <PageState title="Belum ada tujuan keuangan" />
      ) : (
        groups.map(([category, group]) => (
          <section key={category} className="goal-section">
            <h2>{category}</h2>
            <div className="product-summary">
              <div>
                <h2>Saldo terkumpul</h2>
                <strong>{formatCurrency(group.currentBalance)}</strong>
              </div>
              <p>Target {formatCurrency(group.totalTarget)}</p>
            </div>
            <div className="product-account-list">
              {(group.lifegoalslist || []).map((goal) => {
                const progress =
                  Number(goal.targetBalance) > 0
                    ? Math.max(
                        0,
                        Math.min(
                          100,
                          Math.round(
                            (Number(goal.currentBalance) /
                              Number(goal.targetBalance)) *
                              100,
                          ),
                        ),
                      )
                    : 0;
                return (
                  <Link
                    className="product-account-card"
                    key={goal.accountNumber}
                    to={`/lifegoal/${encodeURIComponent(goal.accountNumber)}`}
                    state={{ goal }}
                  >
                    <h2>{goal.lifegoalsTitle}</h2>
                    <p>{progress}% menuju target</p>
                    <strong>{formatCurrency(goal.currentBalance)}</strong>
                    <progress
                      className="goal-progress"
                      max={100}
                      value={progress}
                      aria-label={`Kemajuan ${goal.lifegoalsTitle}`}
                    />
                    <p>Target {formatCurrency(goal.targetBalance)}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        ))
      )}
    </PageLayout>
  );
}
