// Test script to check navigation rendering
const puppeteer = require('puppeteer');

async function testNavigation() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    console.log('BROWSER:', msg.text());
  });
  
  // Enable error logging  
  page.on('pageerror', error => {
    console.error('PAGE ERROR:', error.message);
  });
  
  try {
    console.log('📱 Testing navigation on /app route...');
    await page.goto('http://localhost:5175/app', { waitUntil: 'networkidle0' });
    
    // Wait a bit for React to render
    await page.waitForTimeout(3000);
    
    // Check if TabBar exists
    const tabBar = await page.$('.luxury-tab-container, [data-testid="tab-bar"]');
    console.log('🔍 TabBar found:', !!tabBar);
    
    // Check if navigation buttons exist
    const navButtons = await page.$$('button[role="tab"], .luxury-tab-button');
    console.log('🔍 Navigation buttons count:', navButtons.length);
    
    // Check if icons are visible
    const icons = await page.$$('svg, .luxury-tab-icon');
    console.log('🔍 Icons found:', icons.length);
    
    // Check for any lucide-react elements that might be broken
    const lucideElements = await page.$$('[data-lucide]');
    console.log('🚨 Lucide elements (should be 0):', lucideElements.length);
    
    // Take screenshot for visual inspection
    await page.screenshot({ path: 'navigation-test.png' });
    console.log('📸 Screenshot saved as navigation-test.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testNavigation();