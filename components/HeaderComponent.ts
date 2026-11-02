import { Page, Locator } from "@playwright/test";

export class HeaderComponent {
  readonly userMenu: Locator;
  readonly signOutLink: Locator;
  readonly signInLink: Locator;

  constructor(page: Page) {
    this.userMenu = page.locator("#menu");
    this.signOutLink = page.locator('[data-test="nav-sign-out"]');
    this.signInLink = page.getByRole("link", { name: "Sign in" });
  }

  async logout() {
    await this.userMenu.click();
    await this.signOutLink.click();
  }
}