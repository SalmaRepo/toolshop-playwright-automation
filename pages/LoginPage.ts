import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly email: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.email = page.getByLabel("Email");
    this.password = page.locator("#password");
    this.loginButton = page.getByRole("button", {
      name: "Login",
    });
    this.errorMessage = page.locator(".help-block");
    this.emailError = page.getByText("Email is required");
    this.passwordError = page.getByText("Password is required");
  }

  async navigateToLoginPage() {
    await this.page.goto("/auth/login");
  }

  async loginUser(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async submitEmptyLoginForm() {
    await this.loginButton.click();
  }
}
