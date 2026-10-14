import { api } from '@/shared/api/http.js';

export async function fetchAllCards() {
  const { data } = await api.post('/api/v1/savings', {});
  if (!Array.isArray(data?.accountList))
    throw new Error('Respons rekening tidak valid.');
  return data.accountList.map((card) => ({
    ...card,
    account_id: card.account_id ?? card.accountId,
    type:
      card.type ??
      card.product_name ??
      card.productName ??
      card.accountProductName ??
      'Tabungan',
    account_number: card.account_number ?? card.accountNumber,
    account_holder_name:
      card.account_holder_name ?? card.account_name ?? card.accountName,
    effective_balance:
      card.effective_balance ??
      card.effective_balance_total ??
      card.effectiveBalance ??
      0,
  }));
}
