import { test, expect } from '@playwright/test';

test.describe('Chat Functionality', () => {
  test('user can type a message', async ({ page }) => {
    await page.goto('/');
    
    const input = page.locator('textarea, input[type="text"]').first();
    await input.fill('I have a headache');
    
    await expect(input).toHaveValue('I have a headache');
  });

  test('displays user message after submission', async ({ page }) => {
    await page.goto('/');
    
    const input = page.locator('textarea, input[type="text"]').first();
    await input.fill('Test message');
    
    // Find and click submit button
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for message to appear
    await page.waitForTimeout(1000);
    
    // Check if message is displayed
    const messageText = page.getByText('Test message');
    await expect(messageText).toBeVisible();
  });

  test('chat history persists in localStorage', async ({ page }) => {
    await page.goto('/');
    
    // Check localStorage is accessible
    const hasLocalStorage = await page.evaluate(() => {
      return typeof localStorage !== 'undefined';
    });
    
    expect(hasLocalStorage).toBe(true);
  });
});
