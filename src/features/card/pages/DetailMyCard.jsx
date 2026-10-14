import AccountPortfolio from '@/shared/components/AccountPortfolio.jsx';
import { fetchAllCards } from '@/features/card/api/card.api.js';

async function loadAccounts() {
  const accounts = await fetchAllCards();
  return {
    totalBalance: accounts.reduce(
      (total, account) => total + Number(account.effective_balance || 0),
      0,
    ),
    accounts: accounts.map((account) => ({
      accountNumber: account.account_number,
      title: account.type,
      balance: account.effective_balance,
      details: [['Pemilik', account.account_holder_name]],
    })),
  };
}

export default function DetailMyCard() {
  return (
    <AccountPortfolio
      title="Rekening Anda"
      description="Lihat saldo dan riwayat transaksi dari setiap rekening."
      load={loadAccounts}
    />
  );
}
