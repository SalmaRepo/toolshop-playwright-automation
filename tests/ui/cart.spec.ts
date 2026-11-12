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
    await cart.openCart();
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
    const details = new ProductDetailsPage(page);
    const cart = new CartPage(page);
    const productLinks = await cart.getInstockLinks();
    const productNames: string[] = [];
    for (let i = 0; i < productLinks.length; i++) {
      await page.goto(`${productLinks[i]}`);
      await expect
        .poll(async () => {
          return await details.name.innerText();
        })
        .not.toBe("");
      productNames.push(await details.name.innerText());
      await details.addToCart.click();
      await expect(details.addedToCartMessage).toContainText(
        "Product added to shopping cart.",
      );
    }
    await cart.openCart();
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
    let productPrice = 0;

    await cart.addProductToCart(1);
    await details.addToCart.click();
    await expect(details.addedToCartMessage).toContainText(
      "Product added to shopping cart.",
    );
    productPrice = parsePrice(await details.price.innerText()) * 2;
    await cart.openCart();
    await expect(cart.activeCartTitle).toBeVisible();
    await expect(cart.itemQuantity).toHaveValue(String(2));
    await expect(cart.itemTotal).toHaveText("$" + String(productPrice));
    await expect(cart.cartTotal).toHaveText("$" + String(productPrice));
  });

  test("UI-CRT-04:  Update quantity: line total and cart total recalculate correctly @P2 @Regression", async ({
    page,
  }) => {
    const cart = new CartPage(page);
    const quantityToChange = "2";
    await cart.addProductToCart(1);
    await cart.openCart();
    const priceBefore = await cart.itemPrice.innerText();
    await cart.itemQuantity.fill(quantityToChange);
    const priceAfter = Number(quantityToChange) * parsePrice(priceBefore);
    await expect(cart.itemTotal).toHaveText("$" + String(priceAfter));
    await cart.itemQuantity.press("Enter");
    await expect(cart.quantityUpdatedMessage).toContainText(
      "Product quantity updated.",
    );
    await expect(cart.cartTotal).toHaveText("$" + String(priceAfter));
  });

  test("UI-CRT-05: Remove one item from the Cart @P2 @Regression", async ({
    page,
  }) => {
    const cart = new CartPage(page);
    for (let i = 0; i < 2; i++) {
      await cart.addProductToCart(i);
    }

    await cart.openCart();
    await expect(cart.itemName).toHaveCount(2);
    const numberOfItemsBefore = await cart.itemName.count();
    await cart.removeItemFromCart();
    await expect
      .poll(async () => {
        return cart.itemName.count();
      })
      .toBeLessThan(numberOfItemsBefore);
  });

  test("UI-CRT-06: Remove all items: empty cart state is shown @P2 @Regression", async ({
    page,
  }) => {
    const cart = new CartPage(page);
    for (let i = 0; i < 2; i++) {
      await cart.addProductToCart(i);
    }

    await cart.openCart();
    await expect(cart.itemName).toHaveCount(2);
    while (true) {
      const count = await cart.itemsCountInCart();

      if (count === 0) {
        break;
      }

      await cart.removeItemFromCart();
    }

    await expect(cart.removeItem).not.toBeVisible();
    await expect(page.getByText("The cart is empty. Nothing to display.")).toBeVisible()
    await expect
      .poll(async () => {
        return cart.itemName.count();
      })
      .toBe(0);
  });

  test("UI-CRT-07: Remove all items: empty cart state is shown @P2 @Regression",async ({page})=>{
    const cart = new CartPage(page);
     for (let i = 0; i < 4; i++) {
      await cart.addProductToCart(i);
    }
    await cart.openCart();
      await expect.poll(async ()=>{
       return await cart.itemName.count()
    }).toBe(4);
    const itemsBefore=await cart.itemName.allTextContents()
    await page.reload()
    await expect.poll(async ()=>{
       return await cart.itemName.count()
    }).toBe(4);
    const itemsAfter=await cart.itemName.allTextContents();
    console.log(itemsBefore);
    console.log(itemsAfter)
    expect(itemsBefore).toEqual(itemsAfter)

  })
});
