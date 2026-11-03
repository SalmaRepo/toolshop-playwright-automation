import { Page, Locator } from "@playwright/test";
import { waitForProductsResponse } from "../utils/waits";

export class FiltersComponent {
  readonly page: Page;
  readonly categoryFilters: Locator;
  readonly brandFilters: Locator;
  readonly priceRangeHandles: Locator;

  constructor(page: Page) {
    this.page = page;
    this.categoryFilters = page
      .locator("#filters")
      .filter({ hasText: "By category:" })
      .locator(".checkbox");
    this.brandFilters = page
      .locator("#filters")
      .filter({ hasText: "By brand:" })
      .locator(".checkbox");
    this.priceRangeHandles = page.getByRole("slider");
  }

  // Matches the whole label text, so "Saw" does not also match "Hand Saw".
  private exactText(text: string) {
    return new RegExp(`^\\s*${text}\\s*$`);
  }

  async selectCategory(category: string) {
    await waitForProductsResponse(this.page, () =>
      this.categoryFilters
        .filter({ hasText: this.exactText(category) })
        .click(),
    );
  }

  async selectBrand(brand: string) {
    await waitForProductsResponse(this.page, () =>
      this.brandFilters.filter({ hasText: this.exactText(brand) }).click(),
    );
  }

  private async adjustSlider(handle: Locator, targetValue: number) {
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
    await this.adjustSlider(this.priceRangeHandles.nth(0), min);
    await this.adjustSlider(this.priceRangeHandles.nth(1), max);
  }
}