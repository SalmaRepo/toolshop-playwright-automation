import { Page, Locator } from "@playwright/test";
import { waitForProductsResponse } from "../utils/waits";

export class FiltersComponent {
  readonly page: Page;
  readonly priceRangeHandles: Locator;
  readonly sliderValueMin:Locator;
  readonly sliderValueMax:Locator

  constructor(page: Page) {
    this.page = page;
    this.priceRangeHandles = page.getByRole("slider");
    this.sliderValueMin=page.locator(".ngx-slider-model-value"),
    this.sliderValueMax=page.locator(".ngx-slider-model-high")
  }

  // Locators for assertions (e.g. expect(...).toBeChecked())
  categoryCheckbox(category: string): Locator {
    return this.page.getByRole("checkbox", { name: category, exact: true });
  }

  brandCheckbox(brand: string): Locator {
    return this.page.getByRole("checkbox", { name: brand, exact: true });
  }

  // Actions
  async selectCategory(category: string) {
    await waitForProductsResponse(this.page, () =>
      this.categoryCheckbox(category).check(),
    );
  }

  async selectBrand(brand: string) {
    await waitForProductsResponse(this.page, () =>
      this.brandCheckbox(brand).check(),
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