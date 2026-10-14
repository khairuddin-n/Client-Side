export function tokenFor(role = 'NASABAH', userId = 'test-user') {
  const payload = {
    role,
    userId,
    username: 'Nasabah Uji',
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  return `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.test-signature`;
}

export async function session(page, role = 'NASABAH', userId = 'test-user') {
  await page.addInitScript(
    (token) => {
      sessionStorage.setItem('token', token);
    },
    tokenFor(role, userId),
  );
}

export const accounts = [
  {
    account_number: '111122223333',
    type: 'Tabungan Utama',
    account_holder_name: 'Nasabah Uji',
    effective_balance: 1250000,
  },
  {
    account_number: '444455556666',
    type: 'Tabungan Rencana',
    account_holder_name: 'Nasabah Uji',
    effective_balance: 2500000,
  },
];

export const bill = {
  splitBillId: 'bill-1',
  splitBillTitle: 'Makan bersama',
  totalBill: 100000,
  accountNumber: accounts[0].account_number,
  transactionId: 'trx-1',
  createdTime: '2026-10-01T10:00:00',
  members: [
    { memberId: 'm1', memberName: 'Ayu', amount: 50000, hasPaid: false },
    { memberId: 'm2', memberName: 'Budi', amount: 50000, hasPaid: true },
  ],
};

export async function customerApi(page) {
  await page.route(/^https?:\/\/[^/]+\/api\//, async (route) => {
    const path = new URL(route.request().url()).pathname;
    const responses = {
      '/api/v1/account': { data: accounts },
      '/api/v1/fetch-dashboard': {
        assetoverview: { totalAsset: 3750000 },
        cashFlowOverview: { totalIncome: 1000000, totalExpense: 100000 },
        portfolioOverview: [
          { productName: 'accountSavings', totalAmount: 3750000 },
        ],
        splitBillOverview: {
          totalBillAmount: 100000,
          remainingBillAmount: 50000,
          countSplitBill: 1,
        },
      },
      '/api/v1/trx-history': {
        transaction: [
          {
            transactionId: 'trx-1',
            transactionDate: new Date().toISOString(),
            transactionType: 'QRIS',
            partyName: 'Kafe Uji',
            amount: 100000,
            debitCredit: 'D',
            splitBillId: null,
          },
        ],
      },
      '/api/v1/split-bill': { data: [bill] },
      '/api/v1/split-bill/detail': { data: bill },
      '/api/v1/lifegoals': {
        pendidikan: {
          currentBalance: 200000,
          totalTarget: 1000000,
          lifegoalslist: [
            {
              accountNumber: 'goal-1',
              lifegoalsTitle: 'Kuliah',
              currentBalance: 200000,
              targetBalance: 1000000,
            },
          ],
        },
      },
      '/api/v1/lifegoals-detail': {
        accountNumber: 'goal-1',
        initialDeposit: 100000,
        estimatedAccumulateBalance: 1000000,
        interestRate: 2,
        lifegoalsDuration: 12,
        disbursmentAccountNumber: accounts[0].account_number,
        maturityDate: '2027-01-01',
      },
      '/api/v1/profile': {
        status: true,
        data: {
          firstName: 'Nasabah',
          lastName: 'Uji',
          cif: 'CIF-1',
          dob: '1990-01-01',
          emailAddress: 'test@example.com',
          phoneNumber: '0800000000',
        },
      },
      '/api/v1/savings': {
        targetAccountDetail: { Total_EffectiveBalance: 3750000 },
        accountList: accounts.map((account) => ({
          account_number: account.account_number,
          account_name: account.account_holder_name,
          product_name: account.type,
          effective_balance_total: account.effective_balance,
        })),
      },
      '/api/v1/savings/detail': {
        summary: { total_credit: 100000 },
        category_breakdown: [
          { category: 'Makanan', total_amount: 100000, percent: 100 },
        ],
      },
      '/api/v1/detail-deposit': {
        status: true,
        data: {
          totalBalance: 1000000,
          title: 'Deposito',
          items: [
            {
              depositAccountNumber: 'dep-1',
              balance: 1000000,
              interestRate: 3,
              tenorMonths: 12,
              maturityDate: '2027-01-01',
              status: 'ACTIVE',
            },
          ],
        },
      },
      '/api/v1/dplk': {
        data: [
          {
            title: 'Pensiun',
            totalBalance: 1000000,
            items: [
              {
                depositAccountNumber: 'dplk-1',
                accumulatedBalance: 1000000,
                growth: 3,
              },
            ],
          },
        ],
      },
    };
    await route.fulfill({
      status: responses[path] ? 200 : 500,
      json: responses[path] || { message: 'Unmocked API endpoint' },
    });
  });
}
