import { test as base } from "@playwright/test";
import { RegisterPage } from "../pages/RegisterPage";
import { registrationData } from "../test-data/registrationData";
import { generateUniqueEmail } from "../utils/dataGenerator";

type NewUser = { email: string; password: string };

export const test = base.extend<{ newUser: NewUser }>({
  newUser: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    const email = generateUniqueEmail();

    const registerPage = new RegisterPage(page);
    await registerPage.navigateToRegisterPage();
    await registerPage.registerUser({ ...registrationData, email });
    await page.waitForURL(/login/);
    await context.close();

    await use({ email, password: registrationData.password });
  },
});

export { expect } from "@playwright/test";