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
| Checkout | UI-CHK-01 to [UI-CHK-7] | UI | ✅ Done |
| API | [API-XXX-01 to API-PRD-30] | API | ✅ Done |

**Total: 81 automated tests**

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
│   └── api/          # API specs
├── utils/            # Helpers (e.g. requireEnv, shared flows)
├── .github/workflows # CI pipeline
├── playwright.config.ts
├── .env.example
└── README.md
```

> Adjust folder names to match your actual repo.

## Key design decisions

- **Page Object Model:** locators and page actions live in page classes, and tests only describe behaviour.
- **Independent tests:** a `newUser` fixture registers a fresh user for each test. The Toolshop can remove users, so a shared account is unreliable, and this also lets tests run in any order.
- **Role-based locators:** locators use Playwright's accessible roles where possible, for stability.
- **Reusable flows:** repeated setup steps, such as adding products to the cart before checkout, are extracted into page methods and shared helpers.
- **Fail-fast configuration:** credentials and settings are read from `.env` and validated with a `requireEnv` helper, so a missing variable fails early with a clear message.
- **UI and API together:** API calls are used for fast setup and verification where it makes sense, and they are also tested directly.

## Getting started

### Prerequisites

- Node.js [version]
- npm

### Installation

```bash
git clone https://github.com/[your-username]/toolshop-playwright-automation.git
cd toolshop-playwright-automation
npm install
npx playwright install
```

### Environment setup

1. Copy `.env.example` to `.env`.
2. Fill in the values:

```
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
```

## Running the tests

```bash
# Run everything
npx playwright test

# UI tests only
npx playwright test tests/ui

# API tests only
npx playwright test tests/api

# Run a single file
npx playwright test tests/ui/login.spec.ts

# Run headed
npx playwright test --headed

# Open the HTML report
npx playwright show-report
```

## Continuous integration

Tests run automatically on every push and pull request through GitHub Actions. The HTML report is uploaded as a build artifact.

## Reports

Playwright generates an HTML report after each run, with traces and screenshots for failed tests.


## Author

**Salma**: QA Automation | Playwright | TypeScript
[www.linkedin.com/in/salma-begum-sheik-540bb061] · [https://github.com/SalmaRepo]