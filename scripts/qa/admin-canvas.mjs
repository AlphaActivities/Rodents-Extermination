import { chromium, webkit, devices } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://review.invalid';
const user = { id: '10000000-0000-4000-8000-000000000001', email: 'review@example.invalid' };
const leads = Array.from({ length: 18 }, (_, index) => ({
  id: index + 1, name: 'Review inquiry ' + (index + 1), phone: '', status: 'new',
  created_at: new Date().toISOString(), service_name: 'Inspection', follow_up_at: null,
}));

await mkdir('qa-screenshots', { recursive: true });
for (const engine of [webkit, chromium]) {
  const browser = await engine.launch();
  try {
    const context = await browser.newContext({ ...devices['iPhone 13'], serviceWorkers: 'block' });
    await context.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === origin) {
        const file = route.request().resourceType() === 'document' ? '/index.html' : url.pathname;
        return route.fulfill({ path: path.join('dist', file) }).catch(() => route.abort());
      }
      if (url.origin === 'https://fixture.invalid') {
        const json = url.pathname.endsWith('/leads') ? leads : url.pathname.endsWith('/admins') ? [user] : user;
        return route.fulfill({ json, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
      }
      return route.abort();
    });
    await context.addInitScript(user => {
      localStorage.setItem('sb-fixture-auth-token', JSON.stringify({
        user, access_token: 'offline.fixture.only', refresh_token: 'offline',
        expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer',
      }));
    }, user);
    const page = await context.newPage();
    await page.goto(origin + '/admin/leads');
    await page.getByText('Review inquiry 18', { exact: true }).first().waitFor({ state: 'attached' });
    for (const height of [844, 664, 844]) {
      await page.setViewportSize({ width: 390, height });
      await page.locator('main').evaluate(main => main.scrollTop = main.scrollHeight);
      await page.waitForFunction(() => {
        const shell = document.querySelector('[data-app="admin"]');
        return shell.getBoundingClientRect().bottom >= visualViewport.height - 1;
      });
      const metrics = await page.evaluate(() => ({
        layers: ['html', 'body', '#root', '[data-app="admin"]'].map(selector =>
          getComputedStyle(document.querySelector(selector)).backgroundColor),
        scroll: document.querySelector('main').scrollTop,
      }));
      assert(metrics.layers.every(color => color === 'rgb(11, 13, 19)'));
      assert(metrics.scroll > 0);
    }
    await page.screenshot({ path: 'qa-screenshots/' + engine.name() + '-dashboard.png' });
    await page.goto(origin + '/');
    assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)');
    console.log(engine.name(), 'passed the signed-in dashboard scroll, resize and public background checks');
  } finally {
    await browser.close();
  }
}
