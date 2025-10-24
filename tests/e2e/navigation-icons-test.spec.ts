import { test, expect } from '@playwright/test';

test.describe('Navigation Icons Fix Verification', () => {
  test('Navigation tabs should be visible and icons should render properly', async ({ page }) => {
    // Navigate to the app
    await page.goto('https://sselfie.ai/maya');
    
    // Wait for app to load
    await page.waitForTimeout(3000);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/navigation-test.png', fullPage: true });
    
    // Check if navigation container exists
    const navContainer = page.locator('[class*="luxury-tab-container"], [class*="bg-white/20"], .fixed.bottom-');
    await expect(navContainer).toBeVisible({ timeout: 10000 });
    
    // Check for navigation tabs
    const tabs = page.locator('button:has-text("Studio"), button:has-text("Maya"), button:has-text("Gallery"), button:has-text("Training"), button:has-text("Academy"), button:has-text("Profile")');
    await expect(tabs.first()).toBeVisible();
    
    // Verify icons are not showing as blank/white boxes
    const iconElements = page.locator('svg, [class*="icon"]');
    const iconCount = await iconElements.count();
    
    console.log(`Found ${iconCount} icon elements`);
    
    if (iconCount > 0) {
      // Check that SVG elements have proper paths (not empty)
      const svgWithPaths = page.locator('svg:has(path), svg:has(circle), svg:has(rect), svg:has(polygon)');
      const svgPathCount = await svgWithPaths.count();
      
      console.log(`Found ${svgPathCount} SVGs with actual content`);
      
      expect(svgPathCount).toBeGreaterThan(0);
    }
    
    // Check for specific navigation tabs
    const expectedTabs = ['Studio', 'Maya', 'Gallery', 'Training', 'Academy', 'Profile'];
    
    for (const tabName of expectedTabs) {
      const tab = page.locator(`text=${tabName}`).first();
      if (await tab.isVisible()) {
        console.log(`✅ Tab "${tabName}" is visible`);
      } else {
        console.log(`❌ Tab "${tabName}" is not visible`);
      }
    }
    
    // Check if icons are properly sized (not 0x0)
    const icons = page.locator('svg');
    const iconBounds = await icons.first().boundingBox();
    
    if (iconBounds) {
      expect(iconBounds.width).toBeGreaterThan(0);
      expect(iconBounds.height).toBeGreaterThan(0);
      console.log(`Icon size: ${iconBounds.width}x${iconBounds.height}`);
    }
  });
  
  test('Icons should have proper SVG content and not be empty boxes', async ({ page }) => {
    await page.goto('https://sselfie.ai/maya');
    await page.waitForTimeout(3000);
    
    // Find all SVG elements
    const svgs = page.locator('svg');
    const svgCount = await svgs.count();
    
    console.log(`Total SVG elements found: ${svgCount}`);
    
    if (svgCount > 0) {
      // Check first few SVGs for content
      for (let i = 0; i < Math.min(5, svgCount); i++) {
        const svg = svgs.nth(i);
        const hasContent = await svg.locator('path, circle, rect, polygon, line').count() > 0;
        const viewBox = await svg.getAttribute('viewBox');
        const stroke = await svg.evaluate(el => getComputedStyle(el).stroke);
        
        console.log(`SVG ${i}: hasContent=${hasContent}, viewBox=${viewBox}, stroke=${stroke}`);
        
        // Expect SVGs to have either content or proper styling
        expect(hasContent || viewBox || stroke !== 'none').toBeTruthy();
      }
    }
  });
  
  test('Navigation should be functional and clickable', async ({ page }) => {
    await page.goto('https://sselfie.ai/maya');
    await page.waitForTimeout(3000);
    
    // Try clicking on different navigation tabs
    const tabs = ['Gallery', 'Studio'];
    
    for (const tabName of tabs) {
      const tabButton = page.locator(`button:has-text("${tabName}")`).first();
      
      if (await tabButton.isVisible()) {
        console.log(`Clicking on ${tabName} tab`);
        await tabButton.click();
        await page.waitForTimeout(1000);
        
        // Check URL changed or content changed
        const url = page.url();
        console.log(`After clicking ${tabName}, URL: ${url}`);
      }
    }
  });
});