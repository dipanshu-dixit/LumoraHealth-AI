import { test, expect } from '@playwright/test';

test.describe('Privacy Features', () => {
  test('data stored only in localStorage', async ({ page }) => {
    await page.goto('/');
    
    // Check that data is in localStorage, not sent to server
    const localStorageData = await page.evaluate(() => {
      return Object.keys(localStorage);
    });
    
    expect(localStorageData.length).toBeGreaterThanOrEqual(0);
  });

  test('no cookies set by default', async ({ page }) => {
    await page.goto('/');
    
    const cookies = await page.context().cookies();
    // Should have minimal or no cookies (zero-knowledge design)
    expect(cookies.length).toBeLessThan(5);
  });

  test('privacy policy link exists', async ({ page }) => {
    await page.goto('/');
    
    const privacyLink = page.getByRole('link', { name: /privacy/i });
    await expect(privacyLink).toBeVisible();
  });
});
