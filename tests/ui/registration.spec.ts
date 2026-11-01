
import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/RegisterPage';
import { registrationData } from '../../test-data/registrationData';

test('UI-REG-01: Register a new user and log in successfully', async ({ page }) => {

    const registerPage = new RegisterPage(page);

    const uniqueEmail = `salma_${Date.now()}@example.com`;

    const user = {
        ...registrationData,
        email: uniqueEmail,
        password: 'salmaTest@12345',
        
    };

    // Navigate to registration page
    await registerPage.navigateToRegisterPage();

    // Register a new user
    await registerPage.registerUser(user);

    // Verify successful registration
    await expect(page).toHaveURL(/login/);

    // Login using newly registered credentials
    await page.getByLabel('Email').fill(user.email);
    await page.locator('#password').fill(user.password);

    await page.getByRole('button', { name: 'Login' }).click();

    // Verify successful login
    await expect(page).toHaveURL(/account/);

});
