import { Page, Locator, expect } from "@playwright/test";
import { FiltersComponent } from "../components/FiltersComponent";
import { PaginationComponent } from "../components/PaginationComponent";
import { waitForProductsResponse } from "../utils/waits";
import { ProductDetailsPage } from "./ProductDetailPage";

export class ProductListingPage {
  readonly page: Page;
  readonly filters: FiltersComponent;
  readonly pagination: PaginationComponent;
  readonly details: ProductDetailsPage;
  readonly productCards: Locator;
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly sortDropdown: Locator;
  readonly searchCaption: Locator;
  readonly searchCount: Locator;
  readonly productPrice: Locator;
  readonly outOfStock: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filters = new FiltersComponent(page);
    this.pagination = new PaginationComponent(page);
    this.details = new ProductDetailsPage(page);

    this.productCards = page.locator(".card");

    this.searchBox = page.locator("#search-query");
    this.searchButton = page.getByRole("button", { name: "Search" });
    this.searchCaption = page.locator("[data-test='search-caption']");
    this.searchCount = page.locator("[data-test='search-result-count']");
    this.sortDropdown = page.locator("select");
    this.productPrice = page.locator('[data-test="product-price"]');
    this.outOfStock = page.locator("[data-test='out-of-stock']");
  }

  async navigateToProductsPage() {
    await this.page.goto("/");
  }
  async waitForProducts() {
    await this.productCards.first().waitFor({ state: "visible" });
  }
  async waitForGridToChange(previousNames: string[]) {
    await expect
      .poll(async () => (await this.getAllProductNames()).join("|"))
      .not.toBe(previousNames.join("|"));
  }

  async getAllProducts() {
    await this.waitForProducts();
    return this.productCards;
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
    const names = await this.productCards
      .locator(".card-title")
      .allTextContents();
    return names.map((n) => n.trim());
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
    await this.searchButton.click();
    //await waitForProductsResponse(this.page, () => this.searchButton.click());
  }

  async sortProducts(option: string) {
    await Promise.all([
      this.page.waitForResponse(
        (res) => res.url().includes("/products") && res.ok(),
      ),
      this.sortDropdown.selectOption({ label: option }),
    ]);
  }

  async getNamesFromAllPages(maxPages = 10): Promise<string[]> {
    const all: string[] = [];

    for (let i = 1; i <= maxPages; i++) {
      const names = await this.getAllProductNames();
      all.push(...names.map((n) => n.trim()));

      if (await this.pagination.isLastPage()) {
        return all;
      }

      await this.pagination.goToNextPage();
      await this.waitForGridToChange(names);
    }

    throw new Error(`Last page not reached after ${maxPages} pages`);
  }

  async getPricesFromAllPages(maxPages = 10): Promise<number[]> {
    const all: number[] = [];

    for (let i = 1; i <= maxPages; i++) {
      const names = await this.getAllProductNames();
      const prices = await this.getAllProductPrices();
      all.push(...prices);

      if (await this.pagination.isLastPage()) {
        return all;
      }

      await this.pagination.goToNextPage();
      await this.waitForGridToChange(names);
    }

    throw new Error(`Last page not reached after ${maxPages} pages`);
  }

  async openProduct(productName: string) {
    await this.productCards
      .filter({ has: this.page.getByText(productName, { exact: true }) })
      .click();
  }

  async checkPriceRange(min: number, max: number) {
    const prices = await this.getAllProductPrices();
    for (const price of prices) {
      expect(price).toBeGreaterThanOrEqual(min);
      expect(price).toBeLessThanOrEqual(max);
    }
  }

  async getProductDetails() {
    await this.navigateToProductsPage();
    const card = this.productCards.filter({
    hasNot: this.page.locator("[data-test='out-of-stock']"),
  }).first();
    await this.waitForProducts();
    await expect(card.locator(".card-title")).toBeVisible();
    await expect
      .poll(() => card.locator(".card-title").textContent())
      .not.toHaveLength(0);
    const productName = (await this.getProductName(card).innerText()).trim();
    const productPrice = (await this.getProductPrice(card).innerText())
      ?.trim()
      .slice(1);
    const productImage = await this.getProductImage(card).getAttribute("alt");
    const productLink = await card.getAttribute("href");
    await card.click();
    await expect(this.page).toHaveURL(productLink!);
    await expect(this.details.name).toHaveText(productName);
    return {name:productName,price:productPrice,image:productImage}
  }

}
