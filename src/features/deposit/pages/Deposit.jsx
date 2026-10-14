import AccountPortfolio from '@/shared/components/AccountPortfolio.jsx';
import { getTimeDeposits } from '@/features/deposit/api/time-deposits.api.js';
import { formatDate } from '@/shared/lib/format.js';

async function loadDeposits() {
  const response = await getTimeDeposits();
  return {
    totalBalance: response.data.totalBalance,
    accounts: (response.data.items || []).map((deposit) => ({
      accountNumber: deposit.depositAccountNumber,
      title: response.data.title || 'Deposito',
      balance: deposit.balance,
      details: [
        ['Suku bunga', `${deposit.interestRate}%`],
        ['Tenor', `${deposit.tenorMonths} bulan`],
        ['Jatuh tempo', formatDate(deposit.maturityDate)],
        ['Status', deposit.status],
      ],
    })),
  };
}

export default function Deposit() {
  return (
    <AccountPortfolio
      title="Deposito"
      description="Pantau nilai simpanan, tenor, dan jadwal jatuh tempo Anda."
      load={loadDeposits}
      productType="DEP"
    />
  );
}
