import { test, expect } from '@playwright/test';

// This E2E test covers both the existing user login flow and the new user onboarding/payment/training flow.
test.describe('Core User Journey', () => {
  test('Existing user: login and redirect to app if profile complete', async ({ page }) => {
    // 1. Go to landing page
    await page.goto('/');
    // 2. Click login in nav
    await page.getByRole('navigation').getByText(/log in/i).click();
    // 3. Simulate Stack OAuth login (mock or test account)
    //    (In CI, this step may need to be stubbed or use a test identity provider)
    // 4. Should redirect to /app or /main if gender and training are complete
    await expect(page).toHaveURL(/\/app|\/main/);
    // 5. Should see app UI (e.g., concept cards, nav, etc.)
    await expect(page.getByTestId('app-main')).toBeVisible();
    // 11. Simulate style selection or chat input
    // Try style tab first
    await page.getByTestId('style-tab').first().click();
    // Or, alternatively, enter a vision in chat
    // await page.getByTestId('maya-chat-input').fill('A luxury workspace with gold accents');
    // await page.getByTestId('maya-chat-send').click();

    // 12. Wait for Maya to generate 3–5 concept cards
    const conceptCards = await page.getByTestId('concept-card').all();
    expect(conceptCards.length).toBeGreaterThanOrEqual(3);
    expect(conceptCards.length).toBeLessThanOrEqual(5);

    // 13. Click a concept card to generate an image
    await conceptCards[0].click();

    // 14. Wait for image preview in chat
    await expect(page.getByTestId('image-preview')).toBeVisible({ timeout: 60000 });

    // 15. Check gallery for all generated images
    await page.getByTestId('gallery-tab').click();
    const galleryImages = await page.getByTestId('gallery-image').all();
    expect(galleryImages.length).toBeGreaterThanOrEqual(1);

    // 16. Test heart (favourite), download, delete, and full-size actions
    // Heart (favourite)
    await galleryImages[0].getByTestId('heart-button').click();
    await page.getByTestId('favourites-tab').click();
    const favImages = await page.getByTestId('gallery-image').all();
    expect(favImages.length).toBeGreaterThanOrEqual(1);
    // Download
    await galleryImages[0].getByTestId('download-button').click();
    // Delete
    await galleryImages[0].getByTestId('delete-button').click();
    // Full size
    await galleryImages[0].click();
    await expect(page.getByTestId('fullsize-image')).toBeVisible();
  });

  test('New user: payment, gender, training, and onboarding', async ({ page }) => {
    // 1. Go to landing page
    await page.goto('/');
    // 2. Click CTA to start (e.g., "Get Started" or similar)
    await page.getByRole('button', { name: /get started|start/i }).click();
    // 3. Complete payment flow (simulate or use test Stripe)
    //    (In CI, this step may need to be stubbed or use Stripe test mode)
    await page.getByTestId('checkout-form').fill('test-card-details');
    await page.getByTestId('checkout-submit').click();
    // 4. Should be authenticated and redirected to training page
    await expect(page).toHaveURL(/training|onboarding/);
    // 5. Select gender
    await page.getByLabel(/gender/i).selectOption('woman');
    // 6. Upload images for training
    const fileChooser = await page.waitForEvent('filechooser');
    await fileChooser.setFiles(['tests/fixtures/selfie1.jpg', 'tests/fixtures/selfie2.jpg']);
    // 7. Submit training
    await page.getByTestId('start-training').click();
    // 8. Wait for training to complete (polling or mock)
    await expect(page.getByText(/training complete|model ready/i)).toBeVisible({ timeout: 120000 });
    // 9. Should see trigger word, LoRA weights, and gender stored (UI or API check)
    await expect(page.getByTestId('trigger-word')).toBeVisible();
    await expect(page.getByTestId('lora-status')).toHaveText(/available|ready/i);
    await expect(page.getByTestId('gender-value')).toHaveText(/woman|man|non-binary/i);
    // 10. Should be able to generate images (concept cards visible)
    await expect(page.getByTestId('concept-card')).toBeVisible();
  });
});
