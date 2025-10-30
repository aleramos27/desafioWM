require('dotenv').config();

const baseURL = 'https://www.lider.cl';

const commonContextOptions = {
  locale: process.env.PREFERRED_LOCALE || 'es-CL',
  timezoneId: process.env.PREFERRED_TZ || 'America/Santiago',
  ignoreHTTPSErrors: true,
  javaScriptEnabled: true,
  viewport: null,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  extraHTTPHeaders: {
    'Accept-Language': process.env.PREFERRED_LANG_HEADER || 'es-CL,es;q=0.9'
  }
};

module.exports = {
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 120 * 1000,
  expect: { timeout: 20 * 1000 },
  retries: 0,
  forbidOnly: !!process.env.CI,
  use: {
    baseURL,
    actionTimeout: 15 * 1000,
    navigationTimeout: 45 * 1000,
    trace: 'on',
    video: 'retain-on-failure',
    screenshot: 'on',
    ...commonContextOptions
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  projects: [
    { name: 'chrome', use: { channel: 'chrome' } },
  ],
};
