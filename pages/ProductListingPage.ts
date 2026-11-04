import { Page, Locator,expect } from "@playwright/test";
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
  readonly searchCaption:Locator;
  readonly searchCount:Locator;
  readonly productPrice:Locator;

  constructor(page: Page) {
    this.page = page;
    this.filters = new FiltersComponent(page);
    this.pagination = new PaginationComponent(page);
    

    this.productCards = page.locator(".card");

    this.searchBox = page.locator("#search-query");
    this.searchButton = page.getByRole("button", { name: "Search" });
    this.searchCaption=page.locator("[data-test='search-caption']");
    this.searchCount=page.locator("[data-test='search-result-count']")
    this.sortDropdown = page.locator("select");
    this.productPrice=page.locator('[data-test="product-price"]')

  }

  async navigateToProductsPage() {
    await this.page.goto("/");
  }
  async waitForProducts() {
    await this.productCards.first().waitFor({state:"visible"});
  }
  async waitForGridToChange(previousNames: string[]) {
  await expect
    .poll(async () => (await this.getAllProductNames()).join("|"))
    .not.toBe(previousNames.join("|"));
}

  async getAllProducts(){
    await this.waitForProducts()
    return this.productCards
  }
  async getProductCount(){
    await this.waitForProducts();
    return await this.productCards.count();
  }

  getProductName(card: Locator) {
    return card.locator(".card-title");
  }

  getProductPrice(card: Locator) {
    return card.locator("[data-test='product-price']");
  }

  getProductImage(card:Locator) {
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
    await this.searchButton.click()
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

  async openProduct(productName: string) {
    await this.productCards
      .filter({ has: this.page.getByText(productName, { exact: true }) })
      .click();
  }

  async checkPriceRange(min:number,max:number){
    const prices=await this.getAllProductPrices();
   for (const price of prices) {
  expect(price).toBeGreaterThanOrEqual(min);
  expect(price).toBeLessThanOrEqual(max);
  }
}
}
