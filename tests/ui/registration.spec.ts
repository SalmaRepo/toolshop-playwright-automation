import { test, expect } from "@playwright/test";
import { RegisterPage } from "../../pages/RegisterPage";
import { registrationData } from "../../test-data/registrationData";
import { generateUniqueEmail } from "../../utils/dataGenerator";

test.describe("Registration", async () => {
  const uniqueEmail = `salma_${Date.now()}@example.com`;
  const invalidEmail = "salma_abc,xyz";
  const weakPassword = "abcd";
  test("UI-REG-01: Register a new user and log in successfully @smoke", async ({
    page,
  }) => {
    const email = generateUniqueEmail();
    const registerPage = new RegisterPage(page);

    const user = {
      ...registrationData,
      email: email,
      password: "salmaTest@12345",
    };

    // Navigate to registration page
    await registerPage.navigateToRegisterPage();

    // Register a new user
    await registerPage.registerUser(user);

    // Verify successful registration
    await expect(page).toHaveURL(/login/);

    // Login using newly registered credentials
    await page.getByLabel("Email").fill(user.email);
    await page.locator("#password").fill(user.password);

    await page.getByRole("button", { name: "Login" }).click();

    // Verify successful login
    await expect(page).toHaveURL(/account/);
  });

  test("UI-REG-02: Verify validation errors when all required registration fields are empty @regression", async ({
    page,
  }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.navigateToRegisterPage();

    // Submit without entering any data
    await registerPage.submitEmptyRegistrationForm();

    // Verify required field validation messages

    await expect(page.getByText("First name is required")).toBeVisible();
    await expect(page.getByText("Last name is required")).toBeVisible();
    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("UI-REG-03: Invalid email format is rejected @regression", async ({
    page,
  }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.navigateToRegisterPage();

    // Submit with invalid email
    await registerPage.registerUser({
      ...registrationData,
      email: invalidEmail,
      password: "salmaTest@12345",
    });

    // Verify required field validation messages,
    await expect(page.getByText("Email format is invalid")).toBeVisible();
  });

  test("UI-REG-04: Weak password is rejected @regression", async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.navigateToRegisterPage();

    // Submit with weak password
    await registerPage.registerUser({
      ...registrationData,
      email: uniqueEmail,
      password: weakPassword,
    });

    await expect(
      page.getByText("Password must be minimal 6 characters long."),
    ).toBeVisible();
  });

  test("UI-REG-05: Registering with an already-used email is rejected @regression", async ({
    page,
  }) => {
    const email = generateUniqueEmail();
    const registerPage = new RegisterPage(page);

    await registerPage.navigateToRegisterPage();

    // register
    await registerPage.registerUser({
      ...registrationData,
      email: email,
    });

    //login

    await expect(page).toHaveURL(/login/);
    await page.getByLabel("Email").fill(uniqueEmail);
    await page.locator("#password").fill(registrationData.password);

    await page.getByRole("button", { name: "Login" }).click();

    //Accept registration with same email

    await registerPage.navigateToRegisterPage();
    await registerPage.registerUser({
      ...registrationData,
      email: email,
    });

    //validate error message
    await expect(
      page.getByText("A customer with this email address already exists."),
    ).toBeVisible();
  });
});
