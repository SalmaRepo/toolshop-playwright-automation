import { Page, Locator } from "@playwright/test";

export class ProductListingPage {
  readonly page: Page;
  //// Product listing
  readonly productCards: Locator;

  //Search

  readonly searchBox: Locator;
  readonly searchButton: Locator;

  //Filters
  readonly categoryFilters: Locator;
  readonly brandFilters: Locator;

  // Sorting
  readonly sortDropdown: Locator;

  // Pagination
  readonly nextPageButton: Locator;
  readonly previousPageButton: Locator;
  readonly currentPage: Locator;

  readonly priceRangeHandles: Locator;

  constructor(page: Page) {
    this.page = page;

    this.productCards = page.locator(".card");

    // Search
    this.searchBox = page.locator("#search-query");
    this.searchButton = page.getByRole("button", { name: "Search" });

    // Filters
    this.categoryFilters = page
      .locator("#filters")
      .filter({ hasText: "By category:" })
      .locator(".checkbox");
    this.brandFilters = page
      .locator("#filters")
      .filter({ hasText: "By brand:" })
      .locator(".checkbox");
    this.priceRangeHandles = page.getByRole("slider");

    // Sorting
    this.sortDropdown = page.locator("select");

    // Pagination
    this.nextPageButton = page.locator('[data-test="pagination-next"]');
    this.previousPageButton = page.locator(
      "button[aria-label='Previous'] span[aria-hidden='true']",
    );
    this.currentPage = page.locator("li.page-item.active");
  }

  async navigateToProductsPage() {
    await this.page.goto("/");
  }
  async waitForProducts() {
  await this.productCards.first().waitFor();
}

  // Product card methods
  async getProductCount() {
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

  // Search methods
  async searchProduct(keyword: string) {
    await this.searchBox.fill(keyword);
    await this.searchButton.click();
  }

  // Filter methods
  async selectCategory(category: string) {
    await this.categoryFilters.filter({ hasText: category }).click();
  }

  async selectBrand(brand: string) {
    await this.brandFilters.filter({ hasText: brand }).click();
  }

  async adjustSlider(handle: Locator, targetValue: number) {
    await handle.focus();

    const currentValue = Number(await handle.getAttribute("aria-valuenow"));

    const difference = targetValue - currentValue;
    const key = difference > 0 ? "ArrowRight" : "ArrowLeft";

    for (let i = 0; i < Math.abs(difference); i++) {
      await handle.press(key);
    }
  }
async filterByPrice(min: number, max: number) {
  if (min > max) {
    throw new Error("Minimum price cannot exceed maximum price");
  }

  const minHandle = this.priceRangeHandles.nth(0);
  const maxHandle = this.priceRangeHandles.nth(1);

  await this.adjustSlider(minHandle, min);
  await this.adjustSlider(maxHandle, max);

}
  // Sorting method
 async sortProducts(option: string) {
  await Promise.all([
    this.page.waitForResponse((res) => res.url().includes("/products") && res.ok()),
    this.sortDropdown.selectOption({ label: option }),
  ]);
} 

  // Pagination methods
  async goToNextPage() {
    await this.nextPageButton.click();
  }

  async goToPreviousPage() {
    await this.previousPageButton.click();
  }

  // Open a product by its name
  async openProduct(productName: string) {
  await this.productCards
    .filter({ has: this.page.getByText(productName, { exact: true }) })
    .click();
}
}
