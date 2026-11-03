import { Page } from "@playwright/test";

// Runs an action and waits for the products request it triggers.
export async function waitForProductsResponse(
  page: Page,
  action: () => Promise<void>,
) {
  await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes("/products") && res.ok(),
    ),
    action(),
  ]);
}