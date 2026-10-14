import { expect, test } from '@playwright/test';
import { accounts, bill, customerApi, session, tokenFor } from './helpers.js';
import { readFile } from 'node:fs/promises';

test('public favicon is served as a readable PNG', async ({ request }) => {
  const response = await request.get('/wandoor.png');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/png');
  expect((await response.body()).subarray(0, 8)).toEqual(
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  );
});

test('login uses real server errors and remains responsive', async ({
  page,
}) => {
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({
      status: 401,
      json: { message: 'Username atau password tidak sesuai.' },
    }),
  );
  await page.goto('/');
  await page.getByLabel('Username', { exact: true }).fill('admin');
  await page.getByLabel('Password', { exact: true }).fill('password');
  await page.getByRole('button', { name: 'Tampilkan password' }).click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute(
    'type',
    'text',
  );
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText(
    'Username atau password tidak sesuai.',
  );
  expect(await page.evaluate(() => sessionStorage.getItem('token'))).toBeNull();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('customer login requires OTP before opening the dashboard', async ({
  page,
}) => {
  await customerApi(page);
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({
      json: {
        status: true,
        role: 'NASABAH',
        sessionIdOrToken: 'pending-login',
      },
    }),
  );
  await page.route('**/api/auth/verify-otp', async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      sessionId: 'pending-login',
      otpCode: '123456',
    });
    await route.fulfill({ json: { status: true, token: tokenFor() } });
  });
  await page.goto('/');
  await page.getByLabel('Username', { exact: true }).fill('customer');
  await page.getByLabel('Password', { exact: true }).fill('password');
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Verifikasi kode OTP' }),
  ).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('token'))).toBeNull();
  await page.getByLabel('Kode OTP', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Verifikasi', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(
    page.getByRole('heading', { name: 'Portofolio Anda' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Tampilkan saldo', exact: true })
    .click();
  await expect(page.getByText(/Rp\s*3\.750\.000/).first()).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('password reset preserves the verified session and clears it after success', async ({
  page,
}) => {
  await page.route('**/api/auth/forgot-password/request-otp', (route) =>
    route.fulfill({ json: { status: true, sessionId: 'reset-1' } }),
  );
  await page.route('**/api/auth/forgot-password/verify-otp', (route) =>
    route.fulfill({ json: { status: true, verifiedSession: 'verified-1' } }),
  );
  await page.route(
    '**/api/auth/forgot-password/reset-password',
    async (route) => {
      expect(route.request().postDataJSON()).toEqual({
        verifiedSession: 'verified-1',
        newPassword: 'SecurePass1!',
        confirmPassword: 'SecurePass1!',
      });
      await route.fulfill({ json: { status: true } });
    },
  );
  await page.goto('/forgot');
  await page.getByLabel('Username', { exact: true }).fill('customer');
  await page.getByRole('button', { name: 'Kirim kode OTP' }).click();
  await page.getByLabel('Kode OTP', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Verifikasi', exact: true }).click();
  await page.getByLabel('Password baru', { exact: true }).fill('SecurePass1!');
  await page
    .getByLabel('Konfirmasi password', { exact: true })
    .fill('SecurePass1!');
  await page.getByRole('button', { name: 'Simpan password' }).click();
  await expect(
    page.getByRole('heading', { name: 'Password diperbarui' }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => sessionStorage.getItem('fp_verified')),
  ).toBeNull();
});

test('account selection survives refresh and transaction periods use the current year', async ({
  page,
}) => {
  await session(page);
  await customerApi(page);
  const requests = [];
  page.on('request', (request) => {
    if (request.url().endsWith('/api/v1/trx-history'))
      requests.push(request.postDataJSON());
  });
  await page.goto('/detailmycard?account=' + accounts[1].account_number);
  await expect(
    page.getByRole('heading', { name: 'Rekening Anda', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /Tabungan Rencana/ }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: /Kafe Uji/ })).toBeVisible();
  expect(requests.at(-1)).toMatchObject({
    accountNumber: accounts[1].account_number,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  await page.reload();
  await expect(
    page.getByRole('button', { name: /Tabungan Rencana/ }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /Kafe Uji/ }).click();
  await expect(
    page.getByRole('dialog', { name: 'Detail transaksi' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Ekspor CSV' }).click();
  expect((await download).suggestedFilename()).toMatch(
    /^transaksi_\d{4}_\d+\.csv$/,
  );
});

test('split bill payment failure does not optimistically mark a member paid', async ({
  page,
}) => {
  await session(page);
  await customerApi(page);
  await page.route('**/api/v1/split-bill/mark-paid', (route) =>
    route.fulfill({ status: 500, json: { message: 'Pembayaran gagal' } }),
  );
  await page.goto('/splitbill/detail?bill=bill-1');
  await page.getByRole('button', { name: 'Tandai dibayar' }).click();
  await page.getByRole('button', { name: 'Konfirmasi', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible();
  await expect(page.getByRole('row', { name: /Ayu/ })).toContainText(
    'Belum dibayar',
  );
});

test('split bill editing validates the total and sends the existing transaction identity', async ({
  page,
}) => {
  await session(page);
  await customerApi(page);
  await page.route('**/api/v1/split-bill/edit', async (route) => {
    const payload = route.request().postDataJSON();
    expect(payload).toMatchObject({
      splitBillId: 'bill-1',
      transactionId: 'trx-1',
      totalAmount: 100000,
    });
    expect(payload.billMembers[0]).toMatchObject({
      memberId: 'm1',
      memberName: 'Ayu Baru',
      amountShare: 50000,
    });
    await route.fulfill({ json: { status: true, data: bill } });
  });
  await page.goto('/splitbill/detail?bill=bill-1');
  await page.getByRole('button', { name: 'Ubah', exact: true }).click();
  await page.getByLabel('Peserta 1', { exact: true }).fill('Ayu Baru');
  await page.getByLabel('Nominal (Rp)', { exact: true }).first().fill('40000');
  await page.getByRole('button', { name: 'Simpan perubahan' }).click();
  await expect(page.getByRole('alert')).toHaveText(
    'Jumlah pembagian harus sama dengan total tagihan.',
  );
  await page.getByLabel('Nominal (Rp)', { exact: true }).first().fill('50000');
  await page.getByRole('button', { name: 'Simpan perubahan' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('every customer product route displays actual API-shaped data', async ({
  page,
}) => {
  await session(page);
  await customerApi(page);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const [path, title] of [
    ['/savings', 'Tabungan'],
    ['/deposits', 'Deposito'],
    ['/pensionfunds', 'Dana pensiun'],
    ['/lifegoals', 'Life goals'],
    ['/lifegoal/goal-1', 'Detail life goal'],
    ['/profile', 'Profil & keamanan'],
    ['/splitbill', 'Split bill'],
  ]) {
    await page.goto(path);
    await expect(
      page.getByRole('heading', { name: title, exact: true, level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Memuat data…' }),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('admin API failures show errors rather than dummy users', async ({
  page,
}) => {
  await session(page, 'MAKER', 'maker-1');
  await page.route('**/api/admin/users-list', (route) =>
    route.fulfill({
      status: 503,
      json: { message: 'Layanan sedang tidak tersedia.' },
    }),
  );
  await page.goto('/admin/users');
  await expect(
    page.getByRole('heading', { name: 'Nasabah belum dapat dimuat' }),
  ).toBeVisible();
  await expect(page.getByRole('alert')).toContainText(
    'Layanan sedang tidak tersedia.',
  );
  await expect(page.getByRole('table')).toHaveCount(0);
});

test('maker cannot approve an activity assigned to a checker', async ({
  page,
}) => {
  await session(page, 'MAKER', 'maker-1');
  await page.route('**/api/admin/activity/detail', (route) =>
    route.fulfill({
      json: {
        activityId: 'activity-1',
        activityData: { activityStatus: 'PENDING_CHECKER' },
        checkerData: { userId: 'checker-1', fullName: 'Checker Uji' },
        menuData: { menuName: 'USER_MANAGEMENT', menuAction: 'BLOCK_USER' },
      },
    }),
  );
  await page.goto('/admin/activity/detail?activity=activity-1');
  await expect(page.getByText('PENDING_CHECKER')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Setujui', exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Tolak', exact: true }),
  ).toHaveCount(0);
});

test('assigned checker submits approval with the selected approver', async ({
  page,
}) => {
  await session(page, 'CHECKER', 'checker-1');
  await page.route('**/api/admin/activity/detail', (route) =>
    route.fulfill({
      json: {
        activityId: 'activity-1',
        activityData: { activityStatus: 'PENDING_CHECKER' },
        checkerData: { userId: 'checker-1', fullName: 'Checker Uji' },
      },
    }),
  );
  await page.route('**/api/admin/approver-list', (route) =>
    route.fulfill({
      json: {
        data: [{ userId: 'approver-1', npp: '101', fullName: 'Approver Uji' }],
      },
    }),
  );
  await page.route('**/api/admin/user/approval', async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      activityId: 'activity-1',
      isApprove: true,
      approverData: {
        userId: 'approver-1',
        npp: '101',
        fullName: 'Approver Uji',
      },
    });
    await route.fulfill({ json: { status: true } });
  });
  await page.goto('/admin/activity/detail?activity=activity-1');
  await page.getByRole('button', { name: 'Setujui', exact: true }).click();
  await page.getByLabel('Approver', { exact: true }).selectOption('approver-1');
  await page.getByRole('button', { name: 'Konfirmasi', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('status')).toContainText(
    'Keputusan berhasil diproses.',
  );
});

test('PDF exports contain the real bill title and participant names', async ({
  page,
}) => {
  await session(page);
  await customerApi(page);
  await page.goto('/splitbill/detail?bill=bill-1');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'PDF', exact: true }).click();
  const download = await downloaded;
  expect(download.suggestedFilename()).toBe('wandoor-split-bill.pdf');
  const data = await readFile(await download.path());
  expect(data.subarray(0, 4).toString()).toBe('%PDF');
  expect(data.toString()).toContain('Makan bersama');
  expect(data.toString()).toContain('Ayu');
});

test('all admin list and detail routes handle backend response shapes', async ({
  page,
}) => {
  await session(page, 'MAKER', 'maker-1');
  const user = {
    userId: 'user-1',
    customerId: 'CIF-1',
    customerName: 'Nasabah Uji',
    isBlocked: false,
    countAccount: 1,
  };
  await page.route(/^https?:\/\/[^/]+\/api\/admin\//, async (route) => {
    const path = new URL(route.request().url()).pathname;
    const responses = {
      '/api/admin/transaction/summary': {
        totalAsset: 1000000,
        totalSaving: 1000000,
        users: [{ ...user, userid: user.userId }],
        categories: [],
      },
      '/api/admin/users-list': {
        totalUsers: 1,
        activeUsers: 1,
        blockedUsers: 0,
        users: [user],
      },
      '/api/admin/activity/list': {
        activityList: [
          {
            id: 'activity-1',
            actionFlow: 'CHECKER_AND_APPROVER',
            activityStatus: 'PENDING_CHECKER',
            createdBy: 'Maker Uji',
            createdTime: '2026-10-01',
          },
        ],
      },
      '/api/admin/transaction/list': {
        customerName: user.customerName,
        transactionHistories: [
          {
            transactionId: 'trx-1',
            accountNumber: '1234567890',
            paymentTime: '2026-10-01',
            transactionAmount: 100000,
            status: 'SUCCESS',
            productTypeLabel: 'Tabungan',
            transactionCategory: 'Makanan',
          },
        ],
      },
      '/api/admin/detail-user': {
        ...user,
        accounts: [
          {
            accountNumber: '1234567890',
            productName: 'Tabungan',
            effectiveBalance: 1000000,
          },
        ],
      },
      '/api/admin/menu-access': {
        USER_MANAGEMENT: {
          BLOCK_USER: {
            menu_id: 'menu-1',
            action_flow: 'CHECKER_AND_APPROVER',
          },
        },
      },
      '/api/admin/approver-list': {
        data: [{ userId: 'checker-1', npp: '100', fullName: 'Checker Uji' }],
      },
    };
    await route.fulfill({
      status: responses[path] ? 200 : 500,
      json: responses[path] || {},
    });
  });
  for (const [path, title] of [
    ['/admin/home', 'Ringkasan'],
    ['/admin/users', 'Nasabah'],
    ['/admin/activity', 'Aktivitas'],
    ['/admin/transactions?user=user-1', 'Transaksi nasabah'],
    ['/admin/users/detail?user=user-1', 'Nasabah Uji'],
  ]) {
    await page.goto(path);
    await expect(
      page.getByRole('heading', { name: title, exact: true, level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page
    .getByRole('button', { name: 'Blokir nasabah', exact: true })
    .click();
  await expect(page.getByLabel('Checker', { exact: true })).toBeVisible();
});
