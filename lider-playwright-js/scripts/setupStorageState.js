/**
 * Script opcional para preparar storageState con cookies/consent y reducir fricción del WAF.
 * Ejecuta: `npm run storage` antes de correr los tests si lo deseas.
 */
const { chromium } = require('@playwright/test');
require('dotenv').config();

(async () => {
  const userDataDir = 'user-data';
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    channel: 'chrome',
    locale: process.env.PREFERRED_LOCALE || 'es-CL',
    timezoneId: process.env.PREFERRED_TZ || 'America/Santiago',
    viewport: null,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    permissions: []
  });

  const page = await context.newPage();

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'languages', { get: () => ['es-CL','es'] });
    Object.defineProperty(navigator, 'platform', { get: () => 'Win32' });
  });

  await page.route('**/*', async (route) => {
    const req = route.request();
    if (['image','media','font'].includes(req.resourceType())) {
      return route.abort();
    }
    return route.continue();
  });

  await page.goto('https://www.lider.cl', { waitUntil: 'domcontentloaded' });
  try { await page.locator('button:has-text("Aceptar")').first().click({ timeout: 5000 }); } catch {}

  await context.storageState({ path: 'storageStates/lider.json' });
  await context.close();
  console.log('storageStates/lider.json generado.');
})();
