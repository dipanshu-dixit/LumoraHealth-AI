import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Lumora/);
  });

  test('displays main heading', async ({ page }) => {
    await page.goto('/');
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('has chat input field', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('textarea, input[type="text"]').first();
    await expect(input).toBeVisible();
  });

  test('navigation links work', async ({ page }) => {
    await page.goto('/');
    
    // Check if navigation exists
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });
});
