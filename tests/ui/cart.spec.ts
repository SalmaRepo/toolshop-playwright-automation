import { test, expect } from "@playwright/test";
import { ProductListingPage } from "../../pages/ProductListingPage";
import { ProductDetailsPage } from "../../pages/ProductDetailPage";
import { CartPage } from "../../pages/CartPage";
import { HeaderComponent } from "../../components/HeaderComponent";
import { parsePrice } from "../../utils/price";
test.describe("cart tests", () => {
  test("UI-CRT-01: Add a single product: it appears in the cart with the correct price @P1 @smoke", async ({
    page,
  }) => {
    const listing = new ProductListingPage(page);
    const details = new ProductDetailsPage(page);
    const cart = new CartPage(page);
    const header = new HeaderComponent(page);

    const getProduct = await listing.getProductDetails();
    expect(Number(await details.getQuantity())).toBe(1);
    const nameAdded = getProduct.name;
    const priceAdded = getProduct.price;
    const quantityAdded = await details.getQuantity();
    const expectedLineTotal = parsePrice(priceAdded) * Number(quantityAdded);
    await details.addToCart.click();
    await expect(details.addedToCartMessage).toContainText(
      "Product added to shopping cart.",
    );

    await expect(header.cart).toBeVisible();
    await header.cart.click();
    await expect(page).toHaveURL("/checkout");
    await expect(cart.activeCartTitle).toBeVisible();
    await expect(cart.itemName).toHaveCount(1);
    await expect(cart.itemName).toHaveText(nameAdded);
    await expect
      .poll(async () => parsePrice(await cart.itemPrice.innerText()))
      .toBe(parsePrice(priceAdded));
    await expect(cart.itemQuantity).toHaveValue(String(quantityAdded));
    await expect
      .poll(async () => parsePrice(await cart.itemTotal.innerText()))
      .toBeCloseTo(expectedLineTotal, 2);
    const cartTotal = (await cart.itemTotal.allTextContents())
      .map((itemTotal) => parsePrice(itemTotal))
      .reduce((total, itemTotal) => (itemTotal = total + itemTotal), 0);
    await expect(cart.cartTotal).toHaveText("$" + String(cartTotal));
  });

  test("UI-CRT-02: Add several different products: all appear in the cart @P2 @Regression", async ({
    page,
  }) => {
    const listing = new ProductListingPage(page);
    const details = new ProductDetailsPage(page);
    const cart = new CartPage(page);
    const header = new HeaderComponent(page);

    await listing.navigateToProductsPage();
    await listing.waitForProducts();
    const cards = listing.productCards.filter({
      hasNot: listing.page.locator("[data-test='out-of-stock']"),
    });
    await expect
      .poll(async () => {
        await cards.count();
      })
      .not.toBe(0);
    await listing.waitForProducts();
    const productLinks = await Promise.all(
      (await cards.all()).map((card) => card.getAttribute("href")),
    );
    const productNames: string[] = [];
    for (let i = 0; i < productLinks.length; i++) {
      await page.goto(`${productLinks[i]}`);
      await expect
        .poll(async () => {
          await details.name.innerText();
        })
        .not.toBe("");
      productNames.push(await details.name.innerText());
      await details.addToCart.click();
      await expect(details.addedToCartMessage).toContainText(
        "Product added to shopping cart.",
      );
    }
    console.log(productNames);
    await expect(header.cart).toBeVisible();
    await header.cart.click();
    await expect(page).toHaveURL("/checkout");
    await expect(cart.activeCartTitle).toBeVisible();
    await expect(cart.itemName).toHaveCount(productNames.length);
  });

  test("UI-CRT-03: Add the same product twice: quantity and total are corect @P2 @Regression", async ({
    page,
  }) => {
    const listing = new ProductListingPage(page);
    const details = new ProductDetailsPage(page);
    const cart = new CartPage(page);
    const header = new HeaderComponent(page);

    await listing.navigateToProductsPage();
    await listing.waitForProducts();
    const cards = listing.productCards.filter({
      hasNot: listing.page.locator("[data-test='out-of-stock']"),
    });
    await expect
      .poll(async () => {
        await cards.count();
      })
      .not.toBe(0);
    await listing.waitForProducts();
    const productLinks = await Promise.all(
      (await cards.all()).map((card) => card.getAttribute("href")),
    );
    let productPrice = 0;
    for (let i = 0; i < 2; i++) {
      await page.goto(`${productLinks[1]}`);
      await expect
        .poll(async () => {
          await details.name.innerText();
        })
        .not.toBe("");
      await details.addToCart.click();
      productPrice += parsePrice(await details.price.innerText());
      await expect(details.addedToCartMessage).toContainText(
        "Product added to shopping cart.",
      );
    }
    await expect(header.cart).toBeVisible();
    await header.cart.click();
    await expect(page).toHaveURL("/checkout");
    await expect(cart.activeCartTitle).toBeVisible();
    await expect(cart.itemQuantity).toHaveValue(String(2));
    await expect(cart.itemTotal).toHaveText("$" + String(productPrice));
    await expect(cart.cartTotal).toHaveText("$" + String(productPrice));
  });
});
