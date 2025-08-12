import { test, expect } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:5174';

test('home renders and analyze button visible', async ({ page }) => {
  await page.goto(BASE + '/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.goto(BASE + '/');
  await expect(page.getByRole('heading', { name: 'Code Analysis' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Analyze code' , exact: false})).toBeVisible();
});
