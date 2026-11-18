import { test, expect } from "@playwright/test";
import { CartPage } from "../../pages/CartPage";
import { CheckoutPage } from "../../pages/CheckoutPage";

test.describe("Checkout", () => {
  const paymentMethods = [
    { label: "Cash on Delivery", value: "cash-on-delivery" },
    { label: "Bank Transfer", value: "bank-transfer" },
    { label: "Credit Card", value: "credit-card" },
    { label: "Buy Now Pay Later", value: "buy-now-pay-later" },
    { label: "Gift Card", value: "gift-card" },
  ];
  test("UI-CHK-01: Full happy path: cart, sign-in, billing address, payment, order confirmation @P1 @Smoke", async ({
    page,
  }) => {
    const checkout = new CheckoutPage(page);
    const cartPage = new CartPage(page);
    await checkout.registerUser();
    await checkout.addOrders();
    const ordersCount = await cartPage.itemsCountInCart();
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

  test("UI-CHK-02: Checkout with each available payment method completes successfully @P1 @Regression", async ({
    page,
  }) => {
    const checkout = new CheckoutPage(page);
    const cartPage = new CartPage(page);

    await checkout.registerUser();
    for (const { label, value } of paymentMethods) {
      console.log(`Testing payment method: ${label}`);

      await checkout.addOrders();
      await cartPage.itemsCountInCart();
      await checkout.checkoutClick();

      if (await checkout.loggedInMessage.isVisible()) {
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
      } else {
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
      }

      await checkout.selectMulPayment(label, value);
      await checkout.checkPaymentBtn.click();
      await expect(checkout.successMessage).toBeVisible();
      await checkout.confrimBtn.click();
      await expect(checkout.orderConfirmation).toContainText(
        "Thanks for your order!",
      );
    }
  });
});
