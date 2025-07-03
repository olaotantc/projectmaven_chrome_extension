import { test, expect } from '@playwright/test';

test.describe('Projectmaven Chrome Extension', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a sample Upwork job page
    await page.goto('/jobs/Sample-Job~123456');
  });

  test('should inject Quick Estimate button on Upwork job pages', async ({ page }) => {
    // Wait for the page to load and extension to inject content
    await page.waitForLoadState('networkidle');
    
    // Check if the Quick Estimate button is present
    const quickEstimateBtn = page.locator('#projectmaven-quick-estimate');
    await expect(quickEstimateBtn).toBeVisible();
    await expect(quickEstimateBtn).toHaveText('Quick Estimate');
  });

  test('should show authentication prompt for unauthenticated users', async ({ page }) => {
    // Click the Quick Estimate button
    const quickEstimateBtn = page.locator('#projectmaven-quick-estimate');
    await quickEstimateBtn.click();
    
    // Should show auth prompt (mocked for testing)
    await expect(page.locator('.pm-modal')).toBeVisible();
  });

  test('should show upgrade prompt for Starter tier users', async ({ page }) => {
    // Mock Starter tier user
    await page.addInitScript(() => {
      window.localStorage.setItem('pm-user', JSON.stringify({
        tier: 'starter',
        email: 'test@example.com'
      }));
    });
    
    const quickEstimateBtn = page.locator('#projectmaven-quick-estimate');
    await quickEstimateBtn.click();
    
    // Should show upgrade prompt
    await expect(page.getByText('Upgrade to Pro')).toBeVisible();
  });

  test('should scrape job data correctly', async ({ page }) => {
    // Mock Pro tier user
    await page.addInitScript(() => {
      window.localStorage.setItem('pm-user', JSON.stringify({
        tier: 'pro',
        email: 'pro@example.com',
        hourlyRate: 100
      }));
    });
    
    const quickEstimateBtn = page.locator('#projectmaven-quick-estimate');
    await quickEstimateBtn.click();
    
    // Should attempt to scrape job data and show estimate modal
    await expect(page.locator('.pm-estimate-display')).toBeVisible();
  });
});

test.describe('Extension Popup', () => {
  test('should show login form for unauthenticated users', async ({ page, context }) => {
    // Open extension popup
    const extensionId = 'your-extension-id'; // This would be dynamically determined
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    
    // Should show login form
    await expect(page.locator('#login-view')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('should show settings for authenticated users', async ({ page, context }) => {
    // Mock authenticated user
    await page.addInitScript(() => {
      chrome.storage.local.set({
        user: {
          email: 'test@example.com',
          tier: 'pro',
          hourlyRate: 100
        },
        jwt: 'mock-jwt-token'
      });
    });
    
    const extensionId = 'your-extension-id';
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    
    // Should show settings view
    await expect(page.locator('#settings-view')).toBeVisible();
    await expect(page.locator('#hourly-rate')).toHaveValue('100');
  });
}); 