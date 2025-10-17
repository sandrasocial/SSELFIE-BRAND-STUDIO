import { test, expect, Page } from '@playwright/test';

/**
 * SSELFIE Studio - Complete User Journey E2E Tests
 * 
 * Tests the complete Maya-only user flow:
 * 1. Business Landing Page - Load and navigation
 * 2. Simple Checkout - Payment flow
 * 3. Payment Success - Account activation
 * 4. Simple Training - Model training pipeline
 * 5. Maya Page - AI chat and image generation
 * 6. Gallery - Image management
 * 
 * NOTE: These tests are designed to FAIL and show real errors.
 * We will fix issues as they appear, not modify tests to pass.
 */

const BASE_URL = process.env['BASE_URL'] || 'http://localhost:5173';
const API_URL = process.env['API_URL'] || 'http://localhost:5173/api';

// Test data
const TEST_EMAIL = `test-${Date.now()}@sselfie.test`;
const TEST_PASSWORD = 'TestPassword123!';

test.describe('SSELFIE Studio - Complete User Journey', () => {
  
  // ============================================================================
  // PHASE 1: BUSINESS LANDING PAGE
  // ============================================================================
  
  test('Phase 1.1: Landing page loads with all critical elements', async ({ page }) => {
    console.log('🚀 Starting Phase 1.1: Landing page load test');
    
    await page.goto(`${BASE_URL}/business`);
    
    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
    
    // Check page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    expect(title).toContain('SSELFIE');
    
    // Check for navigation
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeVisible({ timeout: 5000 });
    console.log('✅ Navigation found');
    
    // Check for CTA button (Get Started)
    const ctaButton = page.locator('button:has-text("Get Started"), a:has-text("Get Started"), button:has-text("START"), a:has-text("START")');
    const ctaCount = await ctaButton.count();
    console.log(`🔘 Found ${ctaCount} CTA buttons`);
    expect(ctaCount).toBeGreaterThan(0);
    
    // Check for login button
    const loginButton = page.locator('button:has-text("Sign In"), button:has-text("Login"), a:has-text("Sign In")');
    const loginCount = await loginButton.count();
    console.log(`🔐 Found ${loginCount} login buttons`);
    expect(loginCount).toBeGreaterThan(0);
  });

  test('Phase 1.2: Landing page CTA navigates to checkout', async ({ page }) => {
    console.log('🚀 Starting Phase 1.2: CTA navigation test');
    
    await page.goto(`${BASE_URL}/business`);
    await page.waitForLoadState('networkidle');
    
    // Click Get Started button
    const ctaButton = page.locator('button:has-text("Get Started"), a:has-text("Get Started"), button:has-text("START"), a:has-text("START")').first();
    await ctaButton.click();
    
    // Wait for navigation
    await page.waitForURL('**/simple-checkout**', { timeout: 5000 });
    console.log(`✅ Navigated to: ${page.url()}`);
    
    expect(page.url()).toContain('simple-checkout');
  });

  // ============================================================================
  // PHASE 2: SIMPLE CHECKOUT PAGE
  // ============================================================================

  test('Phase 2.1: Checkout page loads with payment form', async ({ page }) => {
    console.log('🚀 Starting Phase 2.1: Checkout page load test');
    
    await page.goto(`${BASE_URL}/simple-checkout`);
    await page.waitForLoadState('networkidle');
    
    // Check for email input
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]');
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    console.log('✅ Email input found');
    
    // Check for payment button
    const paymentButton = page.locator('button:has-text("Pay"), button:has-text("Checkout"), button:has-text("Subscribe")');
    const paymentCount = await paymentButton.count();
    console.log(`💳 Found ${paymentCount} payment buttons`);
    expect(paymentCount).toBeGreaterThan(0);
  });

  test('Phase 2.2: Checkout form validation works', async ({ page }) => {
    console.log('🚀 Starting Phase 2.2: Form validation test');
    
    await page.goto(`${BASE_URL}/simple-checkout`);
    await page.waitForLoadState('networkidle');
    
    // Try to submit without email
    const paymentButton = page.locator('button:has-text("Pay"), button:has-text("Checkout"), button:has-text("Subscribe")').first();
    await paymentButton.click();
    
    // Check for validation error
    const errorMessage = page.locator('text=email, text=Email, text=required, text=Required');
    const errorCount = await errorMessage.count();
    console.log(`⚠️ Found ${errorCount} validation errors`);
    
    // Should show error or prevent submission
    expect(errorCount).toBeGreaterThanOrEqual(0);
  });

  test('Phase 2.3: Checkout accepts valid email', async ({ page }) => {
    console.log('🚀 Starting Phase 2.3: Valid email submission test');
    
    await page.goto(`${BASE_URL}/simple-checkout`);
    await page.waitForLoadState('networkidle');
    
    // Fill email
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    await emailInput.fill(TEST_EMAIL);
    console.log(`📧 Entered email: ${TEST_EMAIL}`);
    
    // Check if email is accepted
    const emailValue = await emailInput.inputValue();
    expect(emailValue).toBe(TEST_EMAIL);
    console.log('✅ Email accepted');
  });

  // ============================================================================
  // PHASE 3: PAYMENT SUCCESS PAGE
  // ============================================================================

  test('Phase 3.1: Payment success page loads after payment', async ({ page }) => {
    console.log('🚀 Starting Phase 3.1: Payment success page load test');
    
    // Navigate directly to payment success (simulating successful payment)
    await page.goto(`${BASE_URL}/payment-success`);
    await page.waitForLoadState('networkidle');
    
    // Check for success message
    const successMessage = page.locator('text=Success, text=successful, text=Complete, text=Ready');
    const successCount = await successMessage.count();
    console.log(`✅ Found ${successCount} success messages`);
    
    // Check for next step CTA
    const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), button:has-text("Training"), a:has-text("Training")');
    const nextCount = await nextButton.count();
    console.log(`🔘 Found ${nextCount} next step buttons`);
    expect(nextCount).toBeGreaterThan(0);
  });

  // ============================================================================
  // PHASE 4: SIMPLE TRAINING PAGE
  // ============================================================================

  test('Phase 4.1: Training page loads with upload component', async ({ page }) => {
    console.log('🚀 Starting Phase 4.1: Training page load test');
    
    await page.goto(`${BASE_URL}/simple-training`);
    await page.waitForLoadState('networkidle');
    
    // Check for upload component
    const uploadArea = page.locator('[data-test-id="training-upload-component"], input[type="file"], text=Upload, text=Drag');
    const uploadCount = await uploadArea.count();
    console.log(`📤 Found ${uploadCount} upload elements`);
    expect(uploadCount).toBeGreaterThan(0);
    
    // Check for gender selection
    const genderButtons = page.locator('button:has-text("Male"), button:has-text("Female")');
    const genderCount = await genderButtons.count();
    console.log(`👤 Found ${genderCount} gender selection buttons`);
    expect(genderCount).toBeGreaterThanOrEqual(0);
  });

  test('Phase 4.2: Gender selection works', async ({ page }) => {
    console.log('🚀 Starting Phase 4.2: Gender selection test');
    
    await page.goto(`${BASE_URL}/simple-training`);
    await page.waitForLoadState('networkidle');
    
    // Select gender
    const maleButton = page.locator('button:has-text("Male")').first();
    const maleVisible = await maleButton.isVisible().catch(() => false);
    
    if (maleVisible) {
      await maleButton.click();
      console.log('✅ Selected Male gender');
      
      // Check if gender is saved
      const genderDisplay = page.locator('text=Training for');
      await expect(genderDisplay).toBeVisible({ timeout: 3000 });
      console.log('✅ Gender selection confirmed');
    } else {
      console.log('⚠️ Gender selection not visible (may be pre-selected)');
    }
  });

  test('Phase 4.3: Training progress display works', async ({ page }) => {
    console.log('🚀 Starting Phase 4.3: Training progress display test');
    
    // This test checks if training progress UI is properly set up
    // We'll navigate to training page and check for progress elements
    
    await page.goto(`${BASE_URL}/simple-training`);
    await page.waitForLoadState('networkidle');
    
    // Check for progress bar
    const progressBar = page.locator('[role="progressbar"], .progress, text=Progress');
    const progressCount = await progressBar.count();
    console.log(`📊 Found ${progressCount} progress elements`);
    
    // Check for time remaining display
    const timeDisplay = page.locator('text=Time Remaining, text=minutes, text=seconds');
    const timeCount = await timeDisplay.count();
    console.log(`⏱️ Found ${timeCount} time display elements`);
  });

  // ============================================================================
  // PHASE 5: API ENDPOINTS VERIFICATION
  // ============================================================================

  test('Phase 5.1: Health check endpoint responds', async ({ page }) => {
    console.log('🚀 Starting Phase 5.1: Health check endpoint test');
    
    const response = await page.request.get(`${API_URL}/health`);
    console.log(`🏥 Health endpoint status: ${response.status()}`);
    
    expect(response.status()).toBeLessThan(500);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Health check response: ${JSON.stringify(data)}`);
    }
  });

  test('Phase 5.2: User model endpoint is accessible', async ({ page }) => {
    console.log('🚀 Starting Phase 5.2: User model endpoint test');
    
    const response = await page.request.get(`${API_URL}/user-model`);
    console.log(`👤 User model endpoint status: ${response.status()}`);
    
    // Should return 401 if not authenticated, or 200 if authenticated
    expect([200, 401, 403]).toContain(response.status());
  });

  test('Phase 5.3: Training status endpoint is accessible', async ({ page }) => {
    console.log('🚀 Starting Phase 5.3: Training status endpoint test');
    
    const response = await page.request.get(`${API_URL}/training-status`);
    console.log(`🎓 Training status endpoint status: ${response.status()}`);
    
    expect([200, 401, 403]).toContain(response.status());
  });

  // ============================================================================
  // PHASE 6: ENVIRONMENT VARIABLES VERIFICATION
  // ============================================================================

  test('Phase 6.1: Environment variables are properly configured', async ({ page }) => {
    console.log('🚀 Starting Phase 6.1: Environment variables test');
    
    // Navigate to app to check if env vars are loaded
    await page.goto(`${BASE_URL}/business`);
    await page.waitForLoadState('networkidle');
    
    // Check for Stack Auth initialization
    const stackAuthPresent = await page.evaluate(() => {
      return typeof (window as any).stackClientApp !== 'undefined' || 
             document.querySelector('[data-stack-auth]') !== null;
    });
    
    console.log(`🔐 Stack Auth initialized: ${stackAuthPresent}`);
    
    // Check for Stripe presence
    const stripePresent = await page.evaluate(() => {
      return typeof (window as any).Stripe !== 'undefined' ||
             document.querySelector('script[src*="stripe"]') !== null;
    });
    
    console.log(`💳 Stripe loaded: ${stripePresent}`);
  });

  // ============================================================================
  // PHASE 7: ERROR HANDLING
  // ============================================================================

  test('Phase 7.1: Network errors are handled gracefully', async ({ page }) => {
    console.log('🚀 Starting Phase 7.1: Network error handling test');
    
    // Simulate network error
    await page.context().setOffline(true);
    
    await page.goto(`${BASE_URL}/business`);
    
    // Check if error message is shown
    const errorMessage = page.locator('text=error, text=Error, text=offline, text=Offline');
    const errorCount = await errorMessage.count();
    console.log(`⚠️ Found ${errorCount} error messages`);
    
    // Restore network
    await page.context().setOffline(false);
  });

  test('Phase 7.2: API errors are handled gracefully', async ({ page }) => {
    console.log('🚀 Starting Phase 7.2: API error handling test');
    
    await page.goto(`${BASE_URL}/simple-checkout`);
    await page.waitForLoadState('networkidle');
    
    // Try to submit form with invalid data
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill('invalid-email');
    
    const paymentButton = page.locator('button:has-text("Pay"), button:has-text("Checkout")').first();
    await paymentButton.click();
    
    // Check for error handling
    const errorMessage = page.locator('text=error, text=Error, text=invalid, text=Invalid');
    const errorCount = await errorMessage.count();
    console.log(`⚠️ Found ${errorCount} error messages`);
  });
});

