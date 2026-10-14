import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { customerApi, session } from './helpers.js';

test('login meets automated WCAG checks', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Username', { exact: true }).waitFor();
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(result.violations).toEqual([]);
});

test('dashboard and transaction dialogs meet automated WCAG checks', async ({
  page,
}) => {
  await session(page);
  await customerApi(page);
  await page.goto('/dashboard');
  await page.getByRole('heading', { name: 'Portofolio Anda' }).waitFor();
  let result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(result.violations).toEqual([]);
  await page.goto('/detailmycard');
  await page.getByRole('button', { name: /Kafe Uji/ }).click();
  result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(result.violations).toEqual([]);
});
