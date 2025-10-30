/*@typedef {import('@playwright/test').Page} Page */

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class SearchResultsPage {
  /** @param {Page} page */
  constructor(page) {
    this.page = page;

    this.cards = page.locator(
      '[data-automation-id="product-card"], [data-dca-name="product-card"], .product-card, [data-automation-id="search-product"]'
    );

    // Botón "Agregar" 
    this.addButtons = page.locator('[data-automation-id="add-to-cart"]');
    this.resultsHints = page.locator(
      '[data-automation-id="results-count"], [data-automation-id="search-quantity"]'
    );
  }

  async waitForResults() {
    // Espera 
    await Promise.race([
     // this.cards.first().waitFor({ state: 'visible', timeout: 30000 }),
      this.addButtons.first().waitFor({ state: 'visible', timeout: 30000 }),
     // this.resultsHints.first().waitFor({ state: 'visible', timeout: 30000 })
    ]).catch(() => {});
  }

  async addProductByTerm(term) {
    // 1) Intento preferido: botón Agregar cuyo aria-label contenga el término
    const re = new RegExp(escapeRegExp(term), 'i');
    const btnByAria = this.addButtons.filter({ has: this.page.locator('span:has-text("Agregar")') })
                                     .filter({ hasText: re })
                                     .or(this.page.locator('[data-automation-id="add-to-cart"][aria-label]', { hasText: re }));

    if (await btnByAria.first().isVisible().catch(() => false)) {
      await btnByAria.first().scrollIntoViewIfNeeded();
      await btnByAria.first().click();
      return;
    }

    // 2) Fallback: buscar el card que contenga el término y usar su botón Agregar
    const card = this.cards.filter({ hasText: re }).first();
    if (await card.isVisible().catch(() => false)) {
      const addBtnInCard = card.locator('[data-automation-id="add-to-cart"], button:has-text("Agregar")').first();
      await addBtnInCard.scrollIntoViewIfNeeded();
      await addBtnInCard.click();
      return;
    }

    // 3) Última opción: el primer "Agregar" que veamos (no recomendado, pero útil en resultados escuetos)
    if (await this.addButtons.first().isVisible().catch(() => false)) {
      await this.addButtons.first().scrollIntoViewIfNeeded();
      await this.addButtons.first().click();
      return;
    }

    throw new Error(`No encontré botón "Agregar" para el término: ${term}`);
  }
}

module.exports = { SearchResultsPage };
