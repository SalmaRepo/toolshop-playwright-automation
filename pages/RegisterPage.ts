
import { Page, Locator } from '@playwright/test';

export class RegisterPage {
    readonly page: Page;
    readonly firstName: Locator;
    readonly lastName: Locator;
    readonly dob: Locator;
    readonly street: Locator;
    readonly postalCode: Locator;
    readonly city: Locator;
    readonly state: Locator;
    readonly country: Locator;
    readonly phone: Locator;
    readonly email: Locator;
    readonly password: Locator;
    readonly registerButton: Locator;
    readonly houseNumber:Locator;

    constructor(page: Page) {
        this.page = page;

        this.firstName = page.locator('#first_name');
        this.lastName = page.locator('#last_name');
        this.dob = page.getByLabel('Date of birth');
        this.street = page.getByLabel('Street');
        this.postalCode = page.getByLabel('Postal code');
        this.city = page.getByLabel('City');
        this.state = page.getByLabel('State');
        this.country = page.getByLabel('Country');
        this.phone = page.getByLabel('Phone');
        this.email = page.getByLabel('Email');
        this.password = page.getByLabel('Password');
        this.houseNumber=page.getByLabel('House Number');

        this.registerButton = page.getByRole('button', {
            name: 'Register'
        });
    }

    async navigateToRegisterPage() {
        await this.page.goto('https://practicesoftwaretesting.com/auth/register');
    }

    async registerUser(user: {
        firstName: string;
        lastName: string;
        dob: string;
        street: string;
        postalCode: string;
        city: string;
        state: string;
        country: string;
        phone: string;
        email: string;
        password: string;
        houseNumber:string
    }) {
        await this.firstName.fill(user.firstName);
        await this.lastName.fill(user.lastName);
        await this.dob.fill(user.dob);
        await this.street.fill(user.street);
        await this.postalCode.fill(user.postalCode);
        await this.houseNumber.fill(user.houseNumber)
        await this.city.fill(user.city);
        await this.state.fill(user.state);
        await this.country.selectOption({ label: user.country });
        await this.phone.fill(user.phone);
        await this.email.fill(user.email);
        await this.password.fill(user.password);

        await this.registerButton.click();
    }
}
