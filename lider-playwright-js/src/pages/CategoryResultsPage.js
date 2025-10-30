export class CategoryResultsPage {
  constructor(page){
    this.page = page;
    this.title = page.locator('h1');
  }
  async expectTitleContains(expect, texto){
    await expect(this.title.first()).toBeVisible({ timeout: 15_000 });
    await expect(this.title.first()).toContainText(new RegExp(texto, 'i'));
  }
}
