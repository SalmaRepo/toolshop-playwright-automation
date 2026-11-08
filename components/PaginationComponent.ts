import { Page, Locator } from "@playwright/test";
import { waitForProductsResponse } from "../utils/waits";

export class PaginationComponent {
  readonly page: Page;
  readonly nextButton: Locator;
  readonly previousButton: Locator;
  readonly currentPage: Locator;
  readonly lastPage:Locator;
  readonly nextPageItem:Locator

  constructor(page: Page) {
    this.page = page;
    this.nextButton = page.locator('[data-test="pagination-next"]');
    this.previousButton = page.locator("button[aria-label='Previous']");
    this.currentPage = page.locator("li.page-item.active");
    this.lastPage=page.locator("li.page-item.disabled");
    this.nextPageItem = page
  .locator("li.page-item")
  .filter({ has: this.nextButton });
  }

  async goToNextPage() {
     if (await this.isLastPage()) {
      throw new Error("Already on the last page, cannot go to the next page");
    }
    await waitForProductsResponse(this.page, () => this.nextButton.click());
  }

  async goToPreviousPage() {
    await waitForProductsResponse(this.page, () =>
      this.previousButton.click(),
    );
  }

  async getCurrentPageNumber(): Promise<number> {
    const text = await this.currentPage.textContent();
    return Number(text?.trim());
  }

  async isLastPage(): Promise<boolean> {
  return await this.nextPageItem.evaluate(element =>
    element.classList.contains("disabled")
  );
}
  
}