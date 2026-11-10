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
});
