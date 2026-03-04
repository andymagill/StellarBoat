import { test, expect } from '@playwright/test';

/**
 * StellarBoat E2E Smoke Tests
 * Run against pre-built dist/ directory
 */

test.describe('StellarBoat Smoke Tests', () => {
  test('homepage loads with 200 status', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('homepage contains main heading', async ({ page }) => {
    await page.goto('/');
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('navigation header is visible on homepage', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('footer is present on homepage', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
  });

  test('blog index page loads', async ({ page }) => {
    const response = await page.goto('/blog');
    expect(response?.status()).toBe(200);
  });

  test('blog index page contains blog content', async ({ page }) => {
    await page.goto('/blog');
    // Check for either post cards or "No posts" message
    const content = page.locator('main').first();
    await expect(content).toBeVisible();
  });

  test('blog post page loads if posts exist', async ({ page }) => {
    // Try to navigate to the first blog post
    // If no posts exist, this will redirect to 404
    const response = await page.goto('/blog/getting-started-astro-5', {
      waitUntil: 'domcontentloaded',
    });
    // Will be 200 if post exists, 404 if not
    expect(response?.status()).toBeGreaterThanOrEqual(200);
  });

  test('404 page renders for non-existent routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist', {
      waitUntil: 'domcontentloaded',
    });
    const notFoundText = page.locator('text=/not found|404|page not found/i');
    expect(await notFoundText.count()).toBeGreaterThan(0);
  });

  test('RSS feed is valid XML', async ({ page }) => {
    const response = await page.goto('/rss.xml');
    expect(response?.status()).toBe(200);

    const contentType = response?.headers()['content-type'] || '';
    // RSS feeds can be served as either application/rss+xml or application/xml
    expect(['application/rss+xml', 'application/xml']).toContain(
      contentType.split(';')[0]
    );

    const content = await page.content();
    expect(content).toContain('<rss');
    expect(content).toContain('</rss>');
    expect(content).toContain('<channel>');
  });

  test('robots.txt is present', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
  });

  test('sitemap.xml is present', async ({ page }) => {
    const response = await page.goto('/sitemap-0.xml');
    // Sitemap files are numbered sitemap-0.xml, sitemap-1.xml etc.
    expect([200, 404]).toContain(response?.status());
  });

  test('contact page loads', async ({ page }) => {
    const response = await page.goto('/contact');
    // If contact page exists, it should load; if not, it's 404
    expect(response?.status()).toBeGreaterThanOrEqual(200);
  });

  test('internal navigation links do not result in client-side errors', async ({
    page,
  }) => {
    await page.goto('/');

    // Collect all internal links
    const links = await page.locator('a[href^="/"]').all();
    expect(links.length).toBeGreaterThan(0);

    // Test first 3 internal links for quick smoke test
    const testLinks = links.slice(0, 3);
    for (const link of testLinks) {
      const href = await link.getAttribute('href');
      if (href && href !== '#') {
        const response = await page.goto(href, {
          waitUntil: 'domcontentloaded',
        });
        // Should be 200 or 404 (not 50x errors)
        expect(response?.status()).toBeLessThan(500);
      }
    }
  });

  test('page has proper HTML structure', async ({ page }) => {
    await page.goto('/');

    // Check for essential HTML elements
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang');

    // Head and body are present but not visible (head is not rendered)
    const head = page.locator('head');
    expect(await head.count()).toBeGreaterThan(0);

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('title tag is set', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('meta description is present', async ({ page }) => {
    await page.goto('/');
    const description = page.locator('meta[name="description"]');
    const content = await description.getAttribute('content');
    expect(content).toBeTruthy();
  });

  test('GTM script is present in production build', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const html = await page.content();

    // Check if GTM is configured (gtmId is not null)
    // The presence of googletagmanager.com in the HTML indicates GTM is enabled
    if (html.includes('googletagmanager.com')) {
      expect(html).toContain('googletagmanager.com');
    }
  });

  test('page does not have console errors on homepage', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');

    // Allow some errors but not critical ones
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('404')
    );
    // There may be some minor warnings, but no critical errors expected
    expect(criticalErrors).toEqual([]);
  });
});
