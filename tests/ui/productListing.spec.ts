import { test, expect } from "@playwright/test";
import { ProductListingPage } from "../../pages/ProductListingPage";
import { HeaderComponent } from "../../components/HeaderComponent";
import { FiltersComponent } from "../../components/FiltersComponent";
import { waitForProductsResponse } from "../../utils/waits";
import { ProductDetailsPage } from "../../pages/ProductDetailPage";

test.describe("Product listing, search, filters and sorting", () => {
  test("UI-PRD-01: Home page product grid loads with name, price and image for each product @P1 @S", async ({
    page,
  }) => {
    const listing = new ProductListingPage(page);

    await listing.navigateToProductsPage();
    await listing.waitForProducts();

    // 1. The grid is not empty
    await expect(listing.productCards).not.toHaveCount(0);

    // 2. Every card shows a name, a price and an image
    const cards = await listing.productCards.all();

    for (const card of cards) {
      await expect(listing.getProductName(card)).not.toBeEmpty();
      await expect(listing.getProductPrice(card)).toContainText("$");
      await expect(listing.getProductImage(card)).toBeVisible();
    }
  });

  test("UI-PRD-02: Search with a valid keyword returns matching products @P1 @S", async ({
    page,
  }) => {
    const listing = new ProductListingPage(page);

    const productToSearch = "Hammer";

    await listing.navigateToProductsPage();
    await listing.waitForProducts();
    const namesBefore = await listing.getAllProductNames();
    await expect(listing.productCards).not.toHaveCount(0);
    await listing.searchProduct(productToSearch);
    await listing.waitForGridToChange(namesBefore);
    const count = await listing.getProductCount();
    await expect(listing.searchCaption).toBeVisible();
    await expect(listing.searchCaption).toHaveText(
      `Searched for: ${productToSearch}`,
    );
    await expect(listing.searchCount).toHaveText(
      ` ${count} products found for '${productToSearch}' `,
    );
  });

  test("UI-PRD-03: Search with no matches shows a proper noresults message @P2 @R", async ({
    page,
  }) => {
    const listing = new ProductListingPage(page);

    const productToSearch = "noMatch";

    await listing.navigateToProductsPage();
    await listing.waitForProducts();
    await expect(listing.productCards).not.toHaveCount(0);
    await listing.waitForProducts();
    await listing.searchProduct(productToSearch);
    await expect(listing.searchCount).toContainText(
      `0 products found for '${productToSearch}'`,
    );
    await expect(listing.productCards).toHaveCount(0);
    await expect(page.getByText("There are no products found.")).toBeVisible();
  });

  test("UI-PRD-04: Filter by category shows only products of that category @P1 @regression", async ({
    page,
  }) => {
    const listing = new ProductListingPage(page);
    const details = new ProductDetailsPage(page);

    const category = "Wrench";

    await listing.navigateToProductsPage();
    await listing.waitForProducts();

    const namesBefore = await listing.getAllProductNames();

    await listing.filters.selectCategory(category);

    // 1. The filter is ticked
    await expect(listing.filters.categoryCheckbox(category)).toBeChecked();

    // 2. Wait until the grid shows different products
    await listing.waitForGridToChange(namesBefore);
    const count = await listing.getProductCount();

    // Collect the links first, because the page changes when we navigate
    const links: string[] = [];
    for (let i = 0; i < count; i++) {
      const link = await listing.productCards.nth(i).getAttribute("href");
      links.push(link!);
    }

    // Open each product and check its category
    for (const link of links) {
      await page.goto(link);
      await expect(details.category).toContainText(category);
    }
  });
  test("UI-PRD-05: Filter by brand shows only products of that brand @P2 @regression", async ({
    page,
  }) => {
    const listing = new ProductListingPage(page);
    const details = new ProductDetailsPage(page);

    const brand = "MightyCraft Hardware";

    await listing.navigateToProductsPage();
    await listing.waitForProducts();

    const namesBefore = await listing.getAllProductNames();

    await listing.filters.selectBrand(brand);

    // 1. The filter is ticked
    await expect(listing.filters.brandCheckbox(brand)).toBeChecked();

    // 2. Wait until the grid shows different products
    await listing.waitForGridToChange(namesBefore);
    const count = await listing.getProductCount();

    // Collect the links first, because the page changes when we navigate
    const links: string[] = [];
    for (let i = 0; i < count; i++) {
      const link = await listing.productCards.nth(i).getAttribute("href");
      links.push(link!);
    }

    // Open each product and check its brand
    for (const link of links) {
      await page.goto(link);
      await expect(details.brand).toContainText(brand);
    }
  });

  test("UI-PRD-06: Filter by price range returns products within the range @P2 @regression", async ({
    page,
  }) => {
    const listing = new ProductListingPage(page);
    const details = new ProductDetailsPage(page);

    const priceRangeMin = 20;
    const priceRangeMax = 110;

    await listing.navigateToProductsPage();
    await listing.waitForProducts();

    const namesBefore = await listing.getAllProductNames();

    await listing.filters.filterByPrice(priceRangeMin, priceRangeMax);
    await expect(listing.filters.sliderValueMin).toHaveText(
      priceRangeMin.toString(),
    );
    await expect(listing.filters.sliderValueMax).toHaveText(
      priceRangeMax.toString(),
    );

    await expect
      .poll(async () => {
        const prices = await listing.getAllProductPrices();
        return (
          prices.length > 0 &&
          prices.every((p) => p >= priceRangeMin && p <= priceRangeMax)
        );
      })
      .toBe(true);

    const MAX_PAGES_TO_CHECK = 10; // safety limit to prevent an endless loop

    let reachedLastPage = false;
    for (let pageNo = 1; pageNo <= MAX_PAGES_TO_CHECK; pageNo++) {
      const prices = await listing.getAllProductPrices();
      expect(prices.length).toBeGreaterThan(0);

      for (const price of prices) {
        expect(price).toBeGreaterThanOrEqual(priceRangeMin);
        expect(price).toBeLessThanOrEqual(priceRangeMax);
      }

      if (await listing.pagination.isLastPage()) {
        reachedLastPage = true;
        break;
      }

      const namesOnCurrentPage = await listing.getAllProductNames();
      await listing.pagination.goToNextPage();
      await listing.waitForGridToChange(namesOnCurrentPage);
    }

    expect(reachedLastPage).toBe(true);
  });
});
