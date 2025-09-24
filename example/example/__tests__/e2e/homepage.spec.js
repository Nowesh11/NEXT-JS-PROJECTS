// End-to-end tests for the homepage
const { test, expect } = require('@playwright/test');

test.describe('Homepage E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage before each test
    await page.goto('http://localhost:3000');
  });

  test('should load the homepage successfully', async ({ page }) => {
    // Check if the page loads without errors
    await expect(page).toHaveTitle(/Tamil Language Society/);
    
    // Check for main navigation
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for hero section
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    // Test navigation links
    const navLinks = [
      { text: 'Home', url: '/' },
      { text: 'About', url: '/about' },
      { text: 'Projects', url: '/projects' },
      { text: 'E-Books', url: '/ebooks' },
    ];

    for (const link of navLinks) {
      const navLink = page.locator(`nav a:has-text("${link.text}")`);
      await expect(navLink).toBeVisible();
      await expect(navLink).toHaveAttribute('href', link.url);
    }
  });

  test('should display hero section content', async ({ page }) => {
    // Check hero section elements
    await expect(page.locator('h1')).toContainText('Tamil Language Society');
    await expect(page.locator('text=Preserving Tamil Heritage')).toBeVisible();
    
    // Check for call-to-action button
    const ctaButton = page.locator('button:has-text("Get Started")');
    await expect(ctaButton).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle user interactions', async ({ page }) => {
    // Test button clicks
    const getStartedButton = page.locator('button:has-text("Get Started")');
    if (await getStartedButton.isVisible()) {
      await getStartedButton.click();
      // Button should be clickable without errors
      await expect(getStartedButton).toBeVisible();
    }
  });

  test('should load images properly', async ({ page }) => {
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Check if images are loaded
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const image = images.nth(i);
        await expect(image).toBeVisible();
        
        // Check if image has alt text
        const altText = await image.getAttribute('alt');
        expect(altText).toBeTruthy();
      }
    }
  });

  test('should have proper SEO meta tags', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/Tamil Language Society/);
    
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /.+/);
    
    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDescription = page.locator('meta[property="og:description"]');
    
    if (await ogTitle.count() > 0) {
      await expect(ogTitle).toHaveAttribute('content', /.+/);
    }
    
    if (await ogDescription.count() > 0) {
      await expect(ogDescription).toHaveAttribute('content', /.+/);
    }
  });

  test('should be accessible', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1Elements = page.locator('h1');
    await expect(h1Elements.first()).toBeVisible();
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const altText = await image.getAttribute('alt');
      expect(altText).toBeTruthy();
    }
    
    // Check for keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should handle language switching', async ({ page }) => {
    // Look for language toggle if it exists
    const languageToggle = page.locator('[data-testid="language-toggle"]');
    
    if (await languageToggle.isVisible()) {
      await languageToggle.click();
      // Should not cause any errors
      await expect(page.locator('nav')).toBeVisible();
    }
  });

  test('should load without console errors', async ({ page }) => {
    const consoleErrors = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('net::ERR_')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('should have fast loading performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should handle network failures gracefully', async ({ page }) => {
    // Simulate offline condition
    await page.context().setOffline(true);
    
    // Try to navigate
    const response = await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 5000 
    }).catch(() => null);
    
    // Should handle offline gracefully
    expect(response).toBeFalsy();
    
    // Restore online condition
    await page.context().setOffline(false);
  });
});

// Performance tests
test.describe('Homepage Performance Tests', () => {
  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Measure performance metrics
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              metrics.loadTime = entry.loadEventEnd - entry.loadEventStart;
              metrics.domContentLoaded = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
            }
          });
          
          resolve(metrics);
        }).observe({ entryTypes: ['navigation'] });
        
        // Fallback timeout
        setTimeout(() => resolve({}), 3000);
      });
    });
    
    // Basic performance checks
    if (performanceMetrics.loadTime) {
      expect(performanceMetrics.loadTime).toBeLessThan(3000);
    }
  });

  test('should lazy load images efficiently', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check if lazy loading is working
    const lazyImages = page.locator('[data-testid="lazy-image"]');
    const lazyImageCount = await lazyImages.count();
    
    if (lazyImageCount > 0) {
      // Images should be present
      await expect(lazyImages.first()).toBeVisible();
    }
  });
});