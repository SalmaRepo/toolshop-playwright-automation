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

  readonly bankName: Locator;
  readonly accountName: Locator;
  readonly accountNumber: Locator;
  readonly creditCardNumber: Locator;
  readonly expirationDate: Locator;
  readonly cvv: Locator;
  readonly cardHolderName: Locator;
  readonly giftCardNumber: Locator;
  readonly validationCode: Locator;
  readonly checkPaymentBtn: Locator;
  readonly addToCart: CartPage;
  readonly registerPage: RegisterPage;
  readonly successMessage: Locator;
  readonly confrimBtn: Locator;
  readonly orderConfirmation: Locator;
  readonly monthlyInstallments:Locator;

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
      name: " Check payment "
    });
    this.successMessage = page.getByText("Payment was successful");
    this.confrimBtn = page.getByRole("button", { name: "Confirm" });
    this.orderConfirmation = page.locator("#order-confirmation");
    this.bankName = page.locator("#bank_name");
    this.accountName = page.locator("#account_name");
    this.accountNumber = page.locator("#account_number");
    this.creditCardNumber = page.locator("#credit_card_number");
    this.expirationDate = page.locator("#expiration_date");
    this.cvv = page.locator("#cvv");
    this.cardHolderName = page.locator("#card_holder_name");
    this.giftCardNumber = page.locator("#gift_card_number");
    this.validationCode = page.locator("#validation_code");
    this.monthlyInstallments=page.locator("#monthly_installments")
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
    console.log(this.email)
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

  async selectMulPayment(label: string,value: string) {
    await this.selectPaymentMethod.selectOption(label);
    await expect(this.selectPaymentMethod).toHaveValue(value);

    // Handle required fields per payment type
    if (value === "bank-transfer") {
      await this.bankName.fill("Test Bank");
      await this.accountName.fill("Salma Sheik");
      await this.accountNumber.fill("1234567890");
    } else if (value === "credit-card") {
      await this.creditCardNumber.fill("1234-5678-1234-5678");
      await this.expirationDate.fill("12/2028");
      await this.cvv.fill("123");
      await this.cardHolderName.fill("Salma Sheik");
    } else if (value === "gift-card") {
      await this.giftCardNumber.fill("1234567890123456");
      await this.validationCode.fill("1234");
    }else if(value==="buy-now-pay-later"){
       await this.monthlyInstallments.selectOption("6")
    }
    
  }


}
