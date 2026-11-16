import { Page, Locator, expect } from "@playwright/test";
import { CartPage } from "./CartPage";
import { requireEnv } from "../utils/env";
import { RegisterPage } from "./RegisterPage";
import { registrationData } from "../test-data/registrationData";
import { generateUniqueEmail } from "../utils/dataGenerator";

export class CheckoutPage {
  readonly page: Page;
  readonly email: string;
  readonly password: string;
  readonly proceedToCheckout: Locator;
  readonly loginPageInCheckout: Locator;
  readonly emailInCheckout: Locator;
  readonly passwordInCheckout: Locator;
  readonly loginBtnCheckout: Locator;
  readonly loggedInMessage: Locator;
  readonly billingAdressPage: Locator;
  readonly country: Locator;
  readonly postalCode: Locator;
  readonly houseNumber: Locator;
  readonly street: Locator;
  readonly city: Locator;
  readonly state: Locator;
  readonly selectPaymentMethod: Locator;
  readonly checkPaymentBtn: Locator;
  readonly addToCart: CartPage;
  readonly registerPage: RegisterPage;
  readonly successMessage: Locator;
  readonly confrimBtn: Locator;
  readonly orderConfirmation: Locator;

  constructor(page: Page) {
    this.page = page;
    this.email = generateUniqueEmail();
    this.password = requireEnv("TEST_USER_PASSWORD");
    this.addToCart = new CartPage(page);
    this.registerPage = new RegisterPage(page);
    this.proceedToCheckout = page.getByRole("button", {
      name: "Proceed to checkout",
      exact: true,
    });
    this.loginPageInCheckout = page.locator("h3");
    this.emailInCheckout = page.locator("#email");
    this.passwordInCheckout = page.locator("#password");
    this.loginBtnCheckout = page.locator('[data-test="login-submit"]');
    this.loggedInMessage = page.getByText(
      `Hello ${registrationData.firstName} ${registrationData.lastName}, you are already logged in. You can proceed to checkout.`,
    );
    this.billingAdressPage = page.getByRole("heading", {
      name: "Billing Address",
    });
    this.country = page.locator("#country");
    this.postalCode = page.locator("#postal-code");
    this.houseNumber = page.locator("#house_number");
    this.street = page.locator("#street");
    this.city = page.locator("#city");
    this.state = page.locator("#state");
    this.selectPaymentMethod = page.locator("#payment-method");
    this.checkPaymentBtn = page.getByRole("button", {
      name: " Check payment ",
      exact: true,
    });
    this.successMessage = page.getByText("Payment was successful");
    this.confrimBtn = page.getByRole("button", { name: "Confirm" });
    this.orderConfirmation = page.locator("#order-confirmation");
  }

  async checkoutClick() {
    await this.proceedToCheckout.click();
  }

  async addOrders() {
    await this.addToCart.addProductToCart(1);
    await this.addToCart.openCart();
  }

  async registerUser() {
    const user = {
      ...registrationData,
      email: this.email,
      password: this.password,
    };

    await this.registerPage.navigateToRegisterPage();

    // Register a new user
    await this.registerPage.registerUser(user);
  }

  async loginInCheckout() {
    await this.emailInCheckout.fill(this.email);
    await this.passwordInCheckout.fill(this.password);
    await this.loginBtnCheckout.click();
  }

  async billingInCheckout() {
    await expect
      .poll(async () => {
        return (await this.houseNumber.inputValue()).length;
      })
      .toBeGreaterThan(0);
  }

  async selectPayment() {
    await this.selectPaymentMethod.selectOption("Cash on Delivery");
  }
}
