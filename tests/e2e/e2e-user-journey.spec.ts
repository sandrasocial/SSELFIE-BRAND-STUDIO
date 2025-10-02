import { test, expect } from '@playwright/test';

test('Critical User Journey (E2E): New user signup, payment, training, Maya chat, and image generation', async ({ page }) => {
    // Step 1: New User Signup and Authentication
  await page.goto('https://sselfie-brand-studio-309ymihe5-sselfie-studio.vercel.app/handler/sign-in');
  // Click the login button by visible text
  await page.getByText('Login', { exact: true }).click();
    const email = `testuser-${Date.now()}@example.com`;
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill('TestPassword123!');
    await page.getByRole('button', { name: /sign up|create account/i }).click();
    await expect(page.getByText(/welcome|dashboard|checkout/i)).toBeVisible();

    // Step 2: Payment and Checkout
    await expect(page).toHaveURL(/checkout/);
    await page.getByTestId('checkout-form').fill('4242 4242 4242 4242');
    await page.getByLabel(/expiry/i).fill('12/30');
    await page.getByLabel(/cvc/i).fill('123');
    await page.getByLabel(/name/i).fill('Test User');
    await page.getByRole('button', { name: /pay|submit/i }).click();
    await expect(page).toHaveURL(/payment-success/);

    // Step 3: AI Model Training (Mocked)
    await page.goto('/onboarding/simple-training');
    for (let i = 1; i <= 10; i++) {
      await page.getByTestId('image-upload').setInputFiles(`tests/fixtures/selfie${i}.jpg`);
    }
    await page.getByTestId('start-training').click();
    // Mock training completion
    await page.route('**/api/user-model', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ trainingStatus: 'completed' })
      });
    });
    await expect(page.getByText(/training complete|model ready/i)).toBeVisible({ timeout: 10000 });

    // Step 4: App Usage (Post-Training)
    await page.goto('/brand-studio');
    await expect(page.getByTestId('brand-studio-main')).toBeVisible();
    const tabs = ['studio', 'gallery', 'account'];
    for (const tab of tabs) {
      await page.getByTestId(`tab-${tab}`).click();
      await expect(page.getByTestId(`${tab}-page`)).toBeVisible();
    }

    // Step 5: Maya Chat and Concept Card Generation
    await page.getByTestId('tab-maya').click();
    await expect(page.getByText(/maya|welcome/i)).toBeVisible();
    await page.getByTestId('maya-chat-input').fill('I need a professional headshot for my LinkedIn profile');
    await page.getByTestId('maya-chat-send').click();
    // Mock concept card response
    await page.route('**/api/unified-maya-intelligence-service', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          conceptCards: [
            { id: '1', title: 'LinkedIn Headshot', description: 'Professional look', imageUrl: '/mock/headshot1.jpg' },
            { id: '2', title: 'Casual Portrait', description: 'Relaxed style', imageUrl: '/mock/headshot2.jpg' },
            { id: '3', title: 'Creative Shot', description: 'Unique background', imageUrl: '/mock/headshot3.jpg' }
          ]
        })
      });
    });
    await expect(page.getByTestId('concept-card')).toHaveCount(3);
    await page.getByTestId('concept-card').first().getByRole('button', { name: /create this photo/i }).click();
    // Mock image generation
    await page.route('**/api/generate-image', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ imageUrl: '/mock/generated-image.jpg' })
      });
    });
    await expect(page.getByTestId('image-preview')).toHaveAttribute('src', '/mock/generated-image.jpg');
    await page.getByTestId('tab-gallery').click();
    await expect(page.getByTestId('gallery-image')).toHaveAttribute('src', '/mock/generated-image.jpg');
});
