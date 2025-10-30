async function hardenPage(page) {
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
}

module.exports = { hardenPage };
