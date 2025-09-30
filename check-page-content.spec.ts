import { test, expect } from '@playwright/test';

test('Check what content is actually rendering', async ({ page }) => {
  await page.goto('https://sselfie-brand-studio-224gw8sp0-sselfie-studio.vercel.app');
  
  // Wait for React to load
  await page.waitForTimeout(5000);
  
  // Take a screenshot to see what's visible
  await page.screenshot({ path: 'current-page-content.png', fullPage: true });
  
  // Get the full page text
  const pageText = await page.textContent('body');
  console.log('Page text content:', pageText?.substring(0, 500));
  
  // Get all visible elements
  const visibleElements = await page.$$eval('*', elements => 
    elements
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               el.offsetWidth > 0 && 
               el.offsetHeight > 0;
      })
      .map(el => ({
        tag: el.tagName,
        text: el.textContent?.substring(0, 100),
        className: el.className,
        id: el.id
      }))
  );
  
  console.log('Visible elements:', visibleElements.slice(0, 20));
  
  // Check for any React error boundaries
  const errorBoundaries = await page.$$eval('[data-error], .error-boundary, .react-error', 
    elements => elements.map(el => el.textContent)
  );
  
  console.log('Error boundaries:', errorBoundaries);
  
  // Check current URL after any redirects
  console.log('Final URL:', page.url());
});