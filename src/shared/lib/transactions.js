export function groupTransactions(transactions = []) {
  const groups = new Map();
  for (const transaction of transactions) {
    const date = new Date(transaction.transactionDate);
    if (Number.isNaN(date.getTime())) continue;
    const key = String(transaction.transactionDate).slice(0, 10);
    if (!groups.has(key))
      groups.set(key, {
        key,
        date: date.toLocaleDateString('id-ID', { dateStyle: 'medium' }),
        items: [],
      });
    const amount = Math.abs(Number(transaction.amount) || 0);
    const debit = transaction.debitCredit === 'D';
    groups.get(key).items.push({
      ...transaction,
      amount: debit ? -amount : amount,
      type: transaction.transactionType,
      detail: transaction.partyName,
      debit_credit: transaction.debitCredit,
      split_bill_id: transaction.splitBillId ?? null,
    });
  }
  return [...groups.values()].sort((a, b) => b.key.localeCompare(a.key));
}

export function transactionTotals(groups) {
  return groups
    .flatMap((group) => group.items)
    .reduce(
      (totals, transaction) => {
        const amount = Number(transaction.amount);
        if (Number.isFinite(amount)) {
          if (transaction.debit_credit === 'D')
            totals.expense += Math.abs(amount);
          else totals.income += Math.abs(amount);
        }
        return totals;
      },
      { income: 0, expense: 0 },
    );
}
