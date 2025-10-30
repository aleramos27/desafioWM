class CartPage {
  constructor(page) {
    this.page = page;
    this.headerCartBtn = page.locator('#cart-button-header, [data-automation-id="cart-button-header"]');
    this.headerCartBadge = page.locator('#cart-badge, .cart-badge');
    this.cartItems = page.locator('[data-automation-id="cart-item"], .cart-item, [data-automation-id="checkout-cart-item"]');
    this.productsTextCandidates = page.locator('text=/\\b\\d+\\s+productos?\\b/i');
    this.chevronDown = page.locator('i.ld.ld-ChevronDown');
    this.emptyCartHeading = page.locator('h2:has-text("Tu carro está vacío")');
  }

  async open() {
    await this.headerCartBtn.first().click();
    await Promise.race([
      this.productsTextCandidates.first().waitFor({ state: 'visible', timeout: 30000 })
    ]).catch(() => {});
  }
  async getBadgeCount() {
    if (!(await this.headerCartBadge.first().isVisible().catch(() => false))) return null;
    const txt = (await this.headerCartBadge.first().innerText()).trim();
    const n = parseInt(txt.replace(/[^\d]/g, ''), 10);
    return Number.isFinite(n) ? n : null;
  }
  async getRenderedItemsCount() {
    try {
      return await this.cartItems.count();
    } catch {
      return null;
    }
  }

  async getSummaryProductsCount() {
    const all = await this.productsTextCandidates.allTextContents().catch(() => []);
    for (const t of all) {
      const m = t.match(/(\d+)\s+productos?/i);
      if (m) return parseInt(m[1], 10);
    }
    return null;
  }

  async getCartCount() {
    const badge = await this.getBadgeCount();
    if (badge !== null) return badge;
    const rendered = await this.getRenderedItemsCount();
    if (rendered !== null && rendered > 0) return rendered;
    const summary = await this.getSummaryProductsCount();
    if (summary !== null) return summary;
    return null;
  }

  async assertCartCount(expected, expect) {
    const count = await this.getCartCount();
    await expect(count, `Conteo de productos en carro (esperado=${expected})`).toBe(expected);
  }
  async expandSectionsIfAny() {
    if (await this.chevronDown.first().isVisible().catch(() => false)) {
      await this.chevronDown.first().click().catch(() => {});
    }
  }
  async removeByName(name) {
    const safe = name.replace(/"/g, '\\"');
    const direct = this.page.locator(`button[aria-label^="Eliminar"][aria-label*="${safe}"]`).first();
    if (await direct.isVisible().catch(() => false)) {
      await direct.click();
      return;
    }
    const re = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const item = this.cartItems.filter({ hasText: re }).first();
    if (await item.isVisible().catch(() => false)) {
      const del = item.locator('button:has-text("Eliminar"), button[aria-label^="Eliminar"]').first();
      await del.click();
      return;
    }
    throw new Error(`No se encontró botón "Eliminar" para: ${name}`);
  }
  async increaseQtyByName(name, times = 1) {
    const safe = name.replace(/"/g, '\\"');
    const plusIcon = this.page.locator(`button[aria-label*="${safe}"] i.ld.ld-Plus`).first();
    if (await plusIcon.isVisible().catch(() => false)) {
      const plusBtn = plusIcon.locator('xpath=ancestor::button[1]');
      for (let i = 0; i < times; i++) {
        await plusBtn.click();
        await this.page.waitForTimeout(250);
      }
      return;
    }
    const re = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const item = this.cartItems.filter({ hasText: re }).first();
    const btn = item.locator('button:has(i.ld.ld-Plus)').first();
    for (let i = 0; i < times; i++) {
      await btn.click();
      await this.page.waitForTimeout(250);
    }
  }
  async getQtyByName(name) {
    const safe = name.replace(/"/g, '\\"');
    const plusBtn = this.page.locator(`button[aria-label*="${safe}"]`).first();
    if (await plusBtn.isVisible().catch(() => false)) {
      const aria = await plusBtn.getAttribute('aria-label');
      if (aria) {
        const m = aria.match(/Cantidad actual de\s*(\d+)/i);
        if (m) return parseInt(m[1], 10);
      }
    }
    const re = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const item = this.cartItems.filter({ hasText: re }).first();
    const qtyCandidate = item.locator('input[type="number"], [data-automation-id="quantity"], .quantity, [aria-live] >> text=/\\d+/'
    ).first();
    if (await qtyCandidate.isVisible().catch(() => false)) {
      const txt = (await qtyCandidate.innerText().catch(async () => (await qtyCandidate.inputValue().catch(() => '')))) || '';
      const n = parseInt((txt || '').replace(/[^\d]/g, ''), 10);
      if (Number.isFinite(n)) return n;
    }
    return null;
  }
  async assertQtyByName(name, expected, expect) {
  const qty = await this.getQtyByName(name);
  await expect(qty, `Cantidad de "${name}" debe ser ${expected}`).toBe(expected);
}
async clearCart(expect, pauseMs = 500) {
  while (await this.cartItems.count().catch(() => 0) > 0) {
    const firstItem = this.cartItems.first();
    const removeBtn = firstItem.locator('button:has-text("Eliminar"), button[aria-label^="Eliminar"]').first();

    if (await removeBtn.isVisible().catch(() => false)) {
      await removeBtn.scrollIntoViewIfNeeded().catch(() => {});
      await removeBtn.click().catch(() => {});
      await this.page.waitForTimeout(pauseMs);
    } else {
      // Si no hay botón visible, rompe el ciclo
      console.warn('⚠️ No se encontró botón "Eliminar" visible en este ciclo.');
      break;
    }
  }

  // Validación de carrito vacío
  if (this.assertEmpty) {
    await this.assertEmpty(expect);
  } else {
    const remaining = await this.cartItems.count().catch(() => 0);
    await expect(remaining, 'El carrito debería quedar vacío').toBe(0);
  }
}


}
module.exports = { CartPage };
