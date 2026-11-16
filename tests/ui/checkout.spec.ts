import { test, expect } from "@playwright/test";
import { CartPage } from "../../pages/CartPage";
import { CheckoutPage } from "../../pages/CheckoutPage";

test.describe("Checkout", () => {
  test("UI-CHK-01: Full happy path: cart, sign-in, billing address, payment, order confirmation", async ({
    page,
  }) => {
    const checkout = new CheckoutPage(page);
    const cartPage = new CartPage(page);
    await checkout.registerUser();
    await checkout.addOrders();
    const ordersCount = await cartPage.itemsCountInCart();
    //expect(ordersCount).toBeGreaterThan(0);
    await checkout.checkoutClick();
    if (await checkout.loggedInMessage.isVisible()) {
      await checkout.billingInCheckout();
      await checkout.checkoutClick();
    }

    await checkout.loginInCheckout();
    await expect(checkout.loggedInMessage).toBeVisible();
    await checkout.checkoutClick();
    await expect(checkout.country).toBeVisible();
    await page.waitForLoadState("networkidle");

    await checkout.houseNumber.pressSequentially("23", {
      delay: 150,
    });
    await expect(checkout.houseNumber).toHaveValue("23", {
      timeout: 5000,
    });
    await expect(checkout.proceedToCheckout).toBeEnabled();
    await checkout.checkoutClick();
    await checkout.selectPayment();
    await expect(checkout.selectPaymentMethod).toHaveValue("cash-on-delivery");
    await checkout.checkPaymentBtn.click();
    await expect(checkout.successMessage).toBeVisible();
    await checkout.confrimBtn.click();
    await expect(checkout.orderConfirmation).toContainText(
      "Thanks for your order!",
    );
  });
});
