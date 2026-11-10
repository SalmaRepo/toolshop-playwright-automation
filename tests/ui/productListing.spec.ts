import { test, expect } from "@playwright/test";
import { ProductListingPage } from "../../pages/ProductListingPage";
import { ProductDetailsPage } from "../../pages/ProductDetailPage";
import { sortedAZ, sortedNumbers } from "../../utils/sorting";

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
  test("UI-PRD-07:Sort by name (ascending and descending): order is verified @P2 @regression", async ({
    page,
  }) => {
    const listing = new ProductListingPage(page);

    const optionAscending = "Name (A - Z)";
    const optionDescending = "Name (Z - A)";

    await listing.navigateToProductsPage();
    await listing.waitForProducts();

    const namesBefore = await listing.getAllProductNames();

    await listing.sortProducts(optionAscending);
    await expect
      .poll(async () => {
        const names = (await listing.getAllProductNames()).map((n) => n.trim());
        return JSON.stringify(names) === JSON.stringify(sortedAZ(names));
      })
      .toBe(true);
    await listing.waitForGridToChange(namesBefore);

    const ascending = await listing.getNamesFromAllPages();
    expect(ascending).toEqual(sortedAZ(ascending));

    // Descending: start again from the default page
    await listing.navigateToProductsPage();
    await listing.waitForProducts();
    const defaultNames2 = await listing.getAllProductNames();

    await listing.sortProducts(optionDescending);
    await expect
      .poll(async () => {
        const names = (await listing.getAllProductNames()).map((n) => n.trim());
        return (
          JSON.stringify(names) === JSON.stringify(sortedAZ(names).reverse())
        );
      })
      .toBe(true);
    await listing.waitForGridToChange(defaultNames2);

    const descending = await listing.getNamesFromAllPages();
    expect(descending).toEqual(sortedAZ(descending).reverse());
  });

  test("UI-PRD-08:Sort by price (low to high and high to low): order is verified @P2 @regression", async ({
    page,
  }) => {
    const listing = new ProductListingPage(page);
    await listing.navigateToProductsPage();
    await listing.waitForProducts();

    const namesBefore = await listing.getAllProductNames();

    await listing.sortProducts("Price (High - Low)");
    await expect
      .poll(async () => {
        const prices = await listing.getAllProductPrices();
        return (
          prices.length > 0 &&
          prices.every((val, index) => val === sortedNumbers(prices)[index])
        );
      })
      .toBe(true);
    await listing.waitForGridToChange(namesBefore);

    const descendingPrices = await listing.getPricesFromAllPages();
    expect(descendingPrices).toEqual(sortedNumbers(descendingPrices));

    //Ascending: start again from the default page
    await listing.navigateToProductsPage();
    await listing.waitForProducts();
    const defaultNames2 = await listing.getAllProductNames();

    await listing.sortProducts("Price (Low - High)");
    await expect
      .poll(async () => {
        const prices = await listing.getAllProductPrices();
        return (
          prices.length > 0 &&
          prices.every(
            (val, index) => val === sortedNumbers(prices).reverse()[index],
          )
        );
      })
      .toBe(true);
    await listing.waitForGridToChange(defaultNames2);

    const ascendingPrices = await listing.getPricesFromAllPages();
    expect(ascendingPrices).toEqual(sortedNumbers(ascendingPrices).reverse());
  });

  test("UI-PRD-09:Pagination moves between pages and shows different products @P2 @regression", async ({
    page,
  }) => {
    const listing = new ProductListingPage(page);
    await listing.navigateToProductsPage();
    await listing.waitForProducts();
    const max_pages = 10;
    let pagesMoved = 0;
    let reachedLastPage = false;
    for (let i = 0; i <= max_pages; i++) {
      if (await listing.pagination.isLastPage()) {
        reachedLastPage = true;
        break;
      }
      const productsInCurrentPage = await listing.getAllProductNames();
      await listing.waitForProducts();
      const pageNo = await listing.pagination.getCurrentPageNumber();
      await listing.pagination.goToNextPage();
      await listing.waitForGridToChange(productsInCurrentPage);
      await expect
        .poll(() => listing.pagination.getCurrentPageNumber())
        .toBe(pageNo + 1);
      const productsInNextPage = await listing.getAllProductNames();
      expect(
        productsInNextPage.filter((name) =>
          productsInCurrentPage.includes(name),
        ),
      ).toEqual([]);
      pagesMoved++;
    }
    expect(reachedLastPage, "never reached the last page").toBe(true);
    expect(pagesMoved).toBeGreaterThan(0);
  });

  test("UI-PRD-10:Product detail page shows name, price, description and image consistent with the listing @P1 @smoke", async ({
    page,
  }) => {
    const listing = new ProductListingPage(page);
    const details = new ProductDetailsPage(page);
    const allDetails=await listing.getProductDetails();
     
    await expect(details.name).toHaveText(allDetails.name);
    await expect(details.price).toContainText(allDetails.price!);
    expect(await details.image.getAttribute("alt")).toEqual(allDetails.image);
  });

  test("UI-PRD-11:Quantity can be changed on the product detail Page @P3 @Regression", async ({
    page,
  }) => {
    const listing = new ProductListingPage(page);
    const details = new ProductDetailsPage(page);
    await listing.getProductDetails();
    let quantity = await details.getQuantity();
    await details.clickProductIncrease();
    expect(Number(await details.getQuantity())).toBeGreaterThan(
      Number(quantity),
    );
    quantity = await details.getQuantity();
    await details.clickProductDecrease();
    expect(Number(await details.getQuantity())).toBeLessThan(Number(quantity));
  });

  //Add to cart from the product detail page
  test("UI-PRD-12:Add to cart from the product detail page @P1 @smoke", async ({
    page,
  }) => {
    const listing = new ProductListingPage(page);
    const details = new ProductDetailsPage(page);
    await listing.getProductDetails();
    await expect(details.addToCart).toBeVisible();  
    const quantityToAdd=Number(await details.quantity.inputValue());
    const cartBefore = await details.getCartCount();
    await expect(details.cartQuantity).toHaveCount(0);
    await details.addToCart.click();
    await expect(details.addedToCartMessage).toContainText(
      "Product added to shopping cart.",
    );
    await expect(details.cartQuantity).toHaveText(String(cartBefore+quantityToAdd));
  });
});
