import { test, expect } from "../../fixtures/testFixtures";
import { LoginPage } from "../../pages/LoginPage";
import { invalidLogins } from "../../test-data/loginData";
import { HeaderComponent } from "../../components/HeaderComponent";
import {RegisterPage} from "../../pages/RegisterPage";
import {registrationData} from "../../test-data/registrationData"
import {generateUniqueEmail} from "../../utils/dataGenerator"


test.describe("Login and Logout", () => {

  test("UI-LOG-01: Valid login lands on the account page @P1 @smoke @regression", async ({
    page,newUser
  }) => {
    const loginPage = new LoginPage(page);
    const header=new HeaderComponent(page)


    await loginPage.navigateToLoginPage();

    await loginPage.loginUser(newUser.email, newUser.password);
    await expect(
      page.getByText("Here you can manage your profile, favorites and orders."),
    ).toBeVisible();

    await expect(page).toHaveURL(/account/);
    await expect(header.userMenu).toHaveText(`${registrationData.firstName} ${registrationData.lastName}`)

  });

  test("UI-LOG-02: Wrong password shows the correct error @P1 @regression", async ({
    page,
  }) => {
     const registerPage = new RegisterPage(page);
  const loginPage = new LoginPage(page);
  const email = generateUniqueEmail();

  await registerPage.navigateToRegisterPage();
  await registerPage.registerUser({ ...registrationData, email });
  await expect(page).toHaveURL(/login/);

  await loginPage.loginUser(email, invalidLogins.wrongPassword.password);
  await expect(loginPage.errorMessage).toHaveText("Invalid email or password")
  });

  test("UI-LOG-03: Unknown email shows the correct error @P2 @regression", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigateToLoginPage();

    await loginPage.loginUser(
      invalidLogins.unknownEmail.email,
      invalidLogins.unknownEmail.password,
    );

    await expect(page.locator(".help-block")).toBeVisible();
    await expect(page.locator(".help-block")).toHaveText(
      "Invalid email or password",
    );
  });

  test("UI-LOG-04: Empty fields show validation messages  @P2 @regression", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigateToLoginPage();

    //sign in by empty inputs
    await loginPage.submitEmptyLoginForm();

    await expect(page.getByText("Email is required")).toBeVisible();
    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("UI-LOG-05:Logout ends the session and protected pages are no longer accessible  @P1 @regression", async ({
    page,newUser
  }) => {
     const header= new HeaderComponent(page);
    const loginPage = new LoginPage(page);

    await loginPage.navigateToLoginPage();

    //login
    await loginPage.loginUser(newUser.email, newUser.password);

    await expect(page).toHaveURL(/account/);
   
    //logout
    await header.logout()
   

    //verify logout redirects to login page
    await expect(page).toHaveURL(/login/);
    await expect(header.signInLink).toBeVisible();

    //verify protected pages are no longer visible
    await page.goto("/account");
    await expect(page).toHaveURL(/login/);
  });
});
