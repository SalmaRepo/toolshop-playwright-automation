# Toolshop Playwright Automation

A complete end-to-end test automation framework for the [Practice Software Testing (Toolshop)](https://practicesoftwaretesting.com) e-commerce application. It is built with **Playwright** and **TypeScript** using the **Page Object Model (POM)**, and it covers both **UI** and **API** testing.

## About the project

This project automates the full customer journey of an online tool shop: registering, logging in, browsing and filtering products, managing the cart and completing checkout. It also tests the backend directly through the application's Swagger-documented API. The suite comes from a written test plan, and only the cases worth automating are included.

## Tech stack

- Playwright Test
- TypeScript
- Node.js
- dotenv for environment configuration
- GitHub Actions for CI

## Test coverage

| Module | Test IDs | Type | Status |
|---|---|---|---|
| Registration | UI-REG-01 to UI-REG-05 | UI | ✅ Done |
| Login | UI-LOG-01 to UI-LOG-05 | UI | ✅ Done |
| Products: listing, search, filters, sort, pagination, details | UI-PRD-01 to UI-PRD-12 | UI | ✅ Done |
| Cart | UI-CRT-01 to UI-CRT-07 | UI | ✅ Done |
| Checkout | UI-CHK-01 to [UI-CHK-XX] | UI | ✅ Done |
| API | [API-XXX-01 to API-XXX-XX] | API | ✅ Done |

**Total: [N] automated tests**

## Project structure

```
toolshop-playwright-automation/
├── pages/            # Page objects (RegisterPage, LoginPage, ProductListingPage,
│                     #   ProductDetailsPage, CartPage, CheckoutPage)
├── components/       # Reusable UI components (e.g. FiltersComponent)
├── fixtures/         # Custom fixtures (e.g. newUser: a fresh registered user per test)
├── test-data/        # Test data (registrationData, loginData, ...)
├── tests/
│   ├── ui/           # UI specs
│   └── api/