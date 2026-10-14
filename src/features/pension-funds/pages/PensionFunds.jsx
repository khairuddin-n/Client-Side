import AccountPortfolio from '@/shared/components/AccountPortfolio.jsx';
import { getPensionFunds } from '@/features/pension-funds/api/pension-funds.api.js';
import { formatDate } from '@/shared/lib/format.js';

async function loadPensionFunds() {
  const response = await getPensionFunds();
  if (!Array.isArray(response.data))
    throw new Error('Respons dana pensiun tidak valid.');
  return {
    totalBalance: response.data.reduce(
      (total, fund) => total + Number(fund.totalBalance || 0),
      0,
    ),
    accounts: response.data.flatMap((fund) =>
      (fund.items || []).map((item) => ({
        accountNumber: item.depositAccountNumber,
        title: fund.title || 'Dana pensiun',
        balance: item.accumulatedBalance ?? item.balance,
        details: [
          ['Pertumbuhan', `${item.growth ?? 0}%`],
          ['Jatuh tempo', formatDate(item.maturityDate)],
        ],
      })),
    ),
  };
}

export default function PensionFunds() {
  return (
    <AccountPortfolio
      title="Dana pensiun"
      description="Bangun masa depan dengan melihat perkembangan dana pensiun Anda."
      load={loadPensionFunds}
      productType="DPLK"
    />
  );
}
