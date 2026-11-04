import { Page, Locator } from "@playwright/test";

export class ProductDetailsPage {
  readonly page: Page;
  readonly category: Locator;
  readonly brand:Locator;

  constructor(page: Page) {
    this.page = page;
    this.category = page.locator("[aria-label='category']"); 
    this.brand=page.locator("[aria-label='brand']")
}
}