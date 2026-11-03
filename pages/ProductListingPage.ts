import { Page, Locator } from "@playwright/test";
import { FiltersComponent } from "../components/FiltersComponent";
import { PaginationComponent } from "../components/PaginationComponent";
import { waitForProductsResponse } from "../utils/waits";

export class ProductListingPage {
  readonly page: Page;
  readonly filters: FiltersComponent;
  readonly pagination: PaginationComponent;
  readonly productCards: Locator;
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filters = new FiltersComponent(page);
    this.pagination = new PaginationComponent(page);

    this.productCards = page.locator(".card");

    this.searchBox = page.locator("#search-query");
    this.searchButton = page.getByRole("button", { name: "Search" });

    this.sortDropdown = page.locator("select");
  }

  async navigateToProductsPage() {
    await this.page.goto("/");
  }
  async waitForProducts() {
    await this.productCards.first().waitFor();
  }
  async getProductCount() {
    await this.waitForProducts();
    return await this.productCards.count();
  }

  getProductName(card: Locator) {
    return card.locator(".card-title");
  }

  getProductPrice(card: Locator) {
    return card.locator("[data-test='product-price']");
  }

  getProductImage(card: Locator) {
    return card.locator(".card-img-top");
  }
  async getAllProductNames(): Promise<string[]> {
    await this.waitForProducts();
    return this.productCards.locator(".card-title").allTextContents();
  }

  async getAllProductPrices(): Promise<number[]> {
    await this.waitForProducts();
    const texts = await this.productCards
      .locator("[data-test='product-price']")
      .allTextContents();
    return texts.map((t) => Number(t.replace(/[^0-9.]/g, "")));
  }

  async searchProduct(keyword: string) {
    await this.searchBox.fill(keyword);
    await waitForProductsResponse(this.page, () => this.searchButton.click());
  }

  async sortProducts(option: string) {
    await Promise.all([
      this.page.waitForResponse(
        (res) => res.url().includes("/products") && res.ok(),
      ),
      this.sortDropdown.selectOption({ label: option }),
    ]);
  }

  async openProduct(productName: string) {
    await this.productCards
      .filter({ has: this.page.getByText(productName, { exact: true }) })
      .click();
  }
}
