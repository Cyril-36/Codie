import { test, expect } from '@playwright/test';

test('login -> home smoke', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Continue' }).click();

  // App redirects to protected '/' route which renders inside Layout
  await expect(page).toHaveURL(/\/$/, { timeout: 10000 });
  await page.waitForLoadState('domcontentloaded');

  // Be robust to layout wrappers: locate heading by text content
  await expect(page.getByText('Code Analysis')).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole('button', { name: /Analyze Code/i })).toBeVisible();
});
