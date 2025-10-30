class HomePage {
  constructor(page) {
    this.page = page;
    this.searchInput = page.locator('input[data-automation-id="header-input-search"][aria-label="Buscar"]');
    this.searchButton = page.locator('button:has([data-automation-id="search-icon"])');
    this.acceptCookies = page.locator(
      'button:has-text("Aceptar"), button:has-text("Acepto"), button:has-text("Aceptar todas")'
    );
this.categoriesBtn = page.locator(
      'a[role="button"][data-dca-name="Departments"]:has-text("Categorías")'
    );

    // Nivel 1: "Dormitorio"
    this.dormitorioBtn = page.locator(
      'button[data-automation-id="header-departmentL1"][data-dca-name="dormitorio"]'
    );

    // Subcategoría: "Cunas"
    this.cunasLink = page.locator(
      'a.subcategory-item-link[data-dca-name="cunas"], a[href*="/cunas/"]'
    );

    // H1 de la categoría de destino
    this.categoryTitle = page.locator('h1');

    // Cookies (por si aparece)
    this.acceptCookies = page.locator(
      'button:has-text("Aceptar"), button:has-text("Acepto"), button:has-text("Aceptar todas")'
    );

    // Panel/menú de departamentos (mega menú)
    this.departmentsPanel = page.locator(
      '[data-testid="departments-menu"], [data-automation-id="departments"], nav[aria-label*="ategor"], [role="dialog"]'
    );

  }
  async goto() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    if (await this.acceptCookies.first().isVisible().catch(() => false)) {
      await this.acceptCookies.first().click();
    }
  }
  async search(term) {
    await this.searchInput.first().fill(term);
    await this.searchButton.first().click();
  }
async openCategories() {
    const btn = this.categoriesBtn.first();
    await btn.waitFor({ state: 'visible', timeout: 10_000 });

    // Algunos menús se abren por hover; probamos hover y si no, click
    await btn.hover();
    await this.page.waitForTimeout(250 + rand(50, 250));
    const openedByHover = await this.departmentsPanel.first().isVisible().catch(() => false);

    if (!openedByHover) {
      await btn.click();
      await this.page.waitForTimeout(250 + rand(50, 250));
    }

    await this.departmentsPanel.first().waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
  }

  async clickDormitorio() {
    await this.dormitorioBtn.first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.dormitorioBtn.first().click();
    await this.page.waitForTimeout(300 + rand(50, 300));
  }

  async clickCunas() {
    await this.cunasLink.first().waitFor({ state: 'visible', timeout: 10_000 });
    await this.cunasLink.first().click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(400 + rand(100, 400));
  }


}
module.exports = { HomePage };