# Test Plan: Toolshop E-Commerce Automation (Playwright UI + API)

**Prepared by:** Salma
**Date:** 1 November 2026
**Version:** 1.0
**Application under test:** Practice Software Testing, "Toolshop" (https://practicesoftwaretesting.com)
**API documentation:** https://api.practicesoftwaretesting.com/api/documentation

---

## 1. Introduction and Objective

This document describes the strategy, scope, test cases and schedule for an end-to-end test automation framework for the Toolshop demo e-commerce application. The application has a web UI and a documented REST API, which makes it suitable for demonstrating UI automation, API testing and hybrid (UI + API) testing in one project.

**Objectives**

1. Build a maintainable automation framework using Playwright and TypeScript with the Page Object Model (POM).
2. Verify the core customer journeys of the shop: register, log in, find a product, add it to the cart, check out and review the order.
3. Verify the API behind those journeys, including validation, authentication and error handling.
4. Demonstrate hybrid tests that use the API for fast setup and the UI for verification.
5. Run all tests automatically in a CI pipeline and publish a report.

---

## 2. Scope

### 2.1 In scope

- User registration, login and logout
- Product listing, search, filters, sorting, pagination and product details
- Shopping cart
- Checkout, billing address and payment methods
- User account: profile and order history (and favourites, if available)
- Contact form
- The REST API endpoints behind all of the above
- A limited set of non-functional automated checks: cross-browser smoke run, responsive checks on key pages, and basic accessibility scans

### 2.2 Out of scope

- Admin back office
- Real payment processing (the site is a demo)
- Load and stress testing
- Deep security testing and penetration testing
- Manual exploratory testing items (performed informally during development but not part of the automated suite)

---

## 3. Test Approach

### 3.1 Test levels and the reasoning behind them

| Level | Purpose | Why it is used | Approx. share |
|---|---|---|---|
| API tests | Verify business rules, validation, auth and error responses | Fast, stable, precise failure messages | about 40% |
| UI tests | Verify the main user journeys through the browser | Confirms the user can complete tasks, but slower and more fragile, so kept focused | about 50% |
| Hybrid / E2E tests | API for setup, UI for verification (and the reverse) | Faster, more reliable tests and proof that UI and API agree | about 10% |

### 3.2 Tools and technology

| Area | Choice |
|---|---|
| Test framework | Playwright Test |
| Language | TypeScript |
| Design pattern | Page Object Model, plus Playwright fixtures |
| API testing | Playwright `request` fixture (APIRequestContext) |
| Reporting | Playwright HTML report, screenshots and traces on failure |
| Accessibility | axe-core integration for Playwright |
| CI/CD | GitHub Actions |
| Version control | Git and GitHub |
| Configuration | `.env` file (never committed) and `playwright.config.ts` |

### 3.3 Design principles

- **Independent tests:** every test creates the data it needs and does not depend on another test's result. This allows parallel execution.
- **Resilient locators:** prefer `getByRole`, `getByLabel`, `getByTestId` and similar user-facing locators over brittle CSS or XPath.
- **No hard-coded waits:** rely on Playwright's auto-waiting and web-first assertions.
- **Setup through the API:** log in via the API and reuse the saved session (`storageState`) instead of logging in through the UI in every test.
- **Unique test data:** generate unique users per run (for example, with a timestamp in the email).
- **Tagging:** `@smoke` for the critical path, `@regression` for the full suite, and `@api`, `@ui`, `@hybrid` for filtering.

---

## 4. Test Environment and Test Data

- **Environment:** the public Toolshop site and API (shared, so occasional slowness is expected).
- **Browsers:** Chromium (default), Firefox and WebKit (smoke run).
- **Viewports:** desktop, tablet and mobile (key pages only).
- **Credentials and base URLs:** stored in `.env` locally and in GitHub Secrets / environment variables in CI.
- **Test data files:** separate files for search keywords, filter values, payment details and invalid inputs.
- **Users:** one pre-registered user for read-only checks, plus freshly registered unique users for tests that change data.

---

## 5. Proposed Project Structure

```
toolshop-automation/
├── pages/                # Page objects (Login, Register, Home, ProductDetail, Cart, Checkout, Account, Contact)
├── components/           # Reusable components (header, filters, pagination)
├── api/                  # API client helpers (auth, products, cart, orders)
├── fixtures/             # Custom fixtures (page objects, authenticated session, API client)
├── tests/
│   ├── ui/
│   ├── api/
│   ├── hybrid/
│   └── nonfunctional/    # accessibility, responsive
├── test-data/            # JSON data files
├── utils/                # Data generators, helpers
├── .github/workflows/    # CI pipeline
├── playwright.config.ts
├── .env.example
└── README.md
```

---

## 6. Test Cases

**Priority:** P1 = critical, P2 = important, P3 = nice to have.
**Tag:** S = `@smoke` (also part of regression), R = `@regression` only.

Exact endpoint paths, field names and status codes will be confirmed against the Swagger documentation while building each test.

### 6.1 UI tests

#### Registration (REG)

| ID | Test case | Priority | Tag |
|---|---|---|---|
| UI-REG-01 | Register with valid data and then log in with the new account | P1 | S |
| UI-REG-02 | Submit with all required fields empty shows validation errors | P2 | R |
| UI-REG-03 | Invalid email format is rejected | P2 | R |
| UI-REG-04 | Weak password is rejected | P2 | R |
| UI-REG-05 | Registering with an already-used email is rejected | P2 | R |

#### Login and logout (LOG)

| ID | Test case | Priority | Tag |
|---|---|---|---|
| UI-LOG-01 | Valid login lands on the account page | P1 | S |
| UI-LOG-02 | Wrong password shows the correct error | P1 | R |
| UI-LOG-03 | Unknown email shows the correct error | P2 | R |
| UI-LOG-04 | Empty fields show validation messages | P2 | R |
| UI-LOG-05 | Logout ends the session and protected pages are no longer accessible | P1 | R |

#### Product listing, search, filters and sorting (PRD)

| ID | Test case | Priority | Tag |
|---|---|---|---|
| UI-PRD-01 | Home page product grid loads with name, price and image for each product | P1 | S |
| UI-PRD-02 | Search with a valid keyword returns matching products | P1 | S |
| UI-PRD-03 | Search with no matches shows a proper "no results" message | P2 | R |
| UI-PRD-04 | Filter by category shows only products of that category | P1 | R |
| UI-PRD-05 | Filter by brand shows only products of that brand | P2 | R |
| UI-PRD-06 | Filter by price range returns products within the range | P2 | R |
| UI-PRD-07 | Sort by name (ascending and descending): order is verified | P2 | R |
| UI-PRD-08 | Sort by price (low to high and high to low): order is verified | P2 | R |
| UI-PRD-09 | Pagination moves between pages and shows different products | P2 | R |
| UI-PRD-10 | Product detail page shows name, price, description and image consistent with the listing | P1 | S |
| UI-PRD-11 | Quantity can be changed on the product detail page | P3 | R |
| UI-PRD-12 | Add to cart from the product detail page | P1 | S |

#### Cart (CRT)

| ID | Test case | Priority | Tag |
|---|---|---|---|
| UI-CRT-01 | Add a single product: it appears in the cart with the correct price | P1 | S |
| UI-CRT-02 | Add several different products: all appear in the cart | P2 | R |
| UI-CRT-03 | Add the same product twice: quantity and total are correct | P2 | R |
| UI-CRT-04 | Update quantity: line total and cart total recalculate correctly | P1 | R |
| UI-CRT-05 | Remove one item from the cart | P1 | R |
| UI-CRT-06 | Remove all items: empty cart state is shown | P2 | R |
| UI-CRT-07 | Cart contents persist after a page refresh | P2 | R |

#### Checkout and payment (CHK)

| ID | Test case | Priority | Tag |
|---|---|---|---|
| UI-CHK-01 | Full happy path: cart, sign-in, billing address, payment, order confirmation | P1 | S |
| UI-CHK-02 | Checkout with each available payment method completes successfully | P1 | R |
| UI-CHK-03 | Required billing address fields left empty show validation errors | P2 | R |
| UI-CHK-04 | Invalid credit card details are rejected | P2 | R |
| UI-CHK-05 | Order total on confirmation matches the cart total | P1 | R |
| UI-CHK-06 | Checkout requires the user to be logged in (guest is redirected to sign in) | P2 | R |
| UI-CHK-07 | Cart is emptied after a successful order | P2 | R |

#### User account (ACC)

| ID | Test case | Priority | Tag |
|---|---|---|---|
| UI-ACC-01 | Profile page shows the correct user details | P2 | R |
| UI-ACC-02 | A newly placed order appears in the order history with correct details | P1 | R |
| UI-ACC-03 | Add and remove a favourite product (if the feature is available) | P3 | R |

#### Contact form (CNT)

| ID | Test case | Priority | Tag |
|---|---|---|---|
| UI-CNT-01 | Valid contact form submission shows a success message | P2 | R |
| UI-CNT-02 | Empty required fields show validation errors | P2 | R |
| UI-CNT-03 | Invalid email format is rejected | P3 | R |

### 6.2 API tests

For each endpoint, the checks cover: **status code, response schema (fields and data types), negative inputs, authentication and authorisation, and consistency with the UI.**

#### Authentication (AUTH)

| ID | Test case | Priority | Tag |
|---|---|---|---|
| API-AUTH-01 | Register a new user with valid data returns success and the created user | P1 | S |
| API-AUTH-02 | Login with valid credentials returns a token | P1 | S |
| API-AUTH-03 | Login with a wrong password is rejected with the correct status and message | P1 | R |
| API-AUTH-04 | Login with missing fields is rejected | P2 | R |
| API-AUTH-05 | A protected endpoint called without a token is rejected | P1 | R |

#### Products (PRD)

| ID | Test case | Priority | Tag |
|---|---|---|---|
| API-PRD-01 | Get the product list: status, schema and non-empty data | P1 | S |
| API-PRD-02 | Get a single product by a valid ID: details match the list entry | P1 | S |
| API-PRD-03 | Get a product with a nonexistent ID returns the correct error | P2 | R |
| API-PRD-04 | Search products by keyword returns only matching items | P1 | R |
| API-PRD-05 | Filter products by category, brand and price range | P2 | R |
| API-PRD-06 | Sort products by name and price: order is correct | P2 | R |
| API-PRD-07 | Pagination parameters return the correct page size and different pages | P2 | R |

#### Categories and brands (CAT)

| ID | Test case | Priority | Tag |
|---|---|---|---|
| API-CAT-01 | Get the list of categories: status and schema | P2 | R |
| API-CAT-02 | Get the list of brands: status and schema | P2 | R |

#### Cart (CRT)

| ID | Test case | Priority | Tag |
|---|---|---|---|
| API-CRT-01 | Create a cart | P1 | S |
| API-CRT-02 | Add a product to the cart: it is returned in the cart contents | P1 | S |
| API-CRT-03 | Update the quantity of an item in the cart | P2 | R |
| API-CRT-04 | Remove an item from the cart | P2 | R |
| API-CRT-05 | Add a product with an invalid ID or invalid quantity is rejected | P2 | R |

#### Checkout, invoices and payment (CHK)

| ID | Test case | Priority | Tag |
|---|---|---|---|
| API-CHK-01 | Place an order for a valid cart and billing details | P1 | S |
| API-CHK-02 | Placing an order with missing or invalid billing details is rejected | P2 | R |
| API-CHK-03 | Retrieve the created order/invoice and verify its contents and total | P1 | R |

#### User profile (USR)

| ID | Test case | Priority | Tag |
|---|---|---|---|
| API-USR-01 | Get the logged-in user's profile | P2 | R |
| API-USR-02 | Update profile data and verify the change | P3 | R |
| API-USR-03 | A user cannot access another user's data (authorisation check) | P1 | R |

#### Contact messages (CNT)

| ID | Test case | Priority | Tag |
|---|---|---|---|
| API-CNT-01 | Submit a valid contact message | P2 | R |
| API-CNT-02 | Submit with missing or invalid fields is rejected | P3 | R |

#### Cross-cutting API checks (GEN)

| ID | Test case | Priority | Tag |
|---|---|---|---|
| API-GEN-01 | Schema validation of the main responses against the expected structure | P2 | R |
| API-GEN-02 | Response time of key endpoints is within an agreed sensible limit | P3 | R |
| API-GEN-03 | Response headers (content type) are correct | P3 | R |

### 6.3 Hybrid and end-to-end tests (HYB)

| ID | Test case | Priority | Tag |
|---|---|---|---|
| HYB-01 | Log in via API, reuse the saved session, and confirm the UI shows the user as logged in | P1 | S |
| HYB-02 | Create a cart and add items via API, then verify the cart page in the UI | P1 | R |
| HYB-03 | Place an order through the UI, then verify it through the API | P1 | R |
| HYB-04 | Product name and price shown in the UI match the API response for several products | P2 | R |
| HYB-05 | Create an order via API, then verify it appears in the UI order history | P2 | R |
| HYB-06 | Full journey: register, log in, search, add to cart, check out, confirm in order history | P1 | S |

### 6.4 Automated non-functional checks (NFR)

| ID | Test case | Priority | Tag |
|---|---|---|---|
| NFR-01 | Smoke suite runs on Chromium, Firefox and WebKit | P1 | R |
| NFR-02 | Home, product detail, cart and login pages render correctly at mobile, tablet and desktop widths | P2 | R |
| NFR-03 | Automated accessibility scan (axe) on home, product, cart and login pages reports no critical violations | P2 | R |

**Total planned automated tests: 81** (UI 42, API 30 including 3 cross-cutting checks, hybrid 6, non-functional 3).

---

## 7. Test Execution Strategy

| Suite | Contents | When it runs |
|---|---|---|
| Smoke | All tests tagged `@smoke` | On every push and pull request |
| Regression | All tests | Daily scheduled run and before releases of the framework |
| Cross-browser | Smoke suite on Firefox and WebKit | Scheduled run |

- Tests run in parallel; one retry is allowed in CI to absorb network flakiness. A test that needs more than one retry is investigated, not ignored.
- On failure, a screenshot, video and trace are captured and attached to the report.

---

## 8. Entry and Exit Criteria

**Entry criteria**

- The Toolshop site and API are reachable.
- A new user can be registered and can log in.
- The framework runs one sample UI test and one sample API test successfully.

**Exit criteria**

- All P1 tests are implemented and passing.
- At least 90% of planned tests are implemented, and every failing test is either fixed or documented as a known application issue.
- The HTML report is generated and the CI pipeline is green.
- The README documents setup, structure, how to run each suite and how to read the report.

---

## 9. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| The public site is slow or temporarily unavailable | Flaky or failing runs | Use auto-waiting, one CI retry, and re-run before investigating |
| The site changes (locators, products, prices) | Broken tests | Resilient locators, no hard-coded product data, centralised page objects |
| Shared data collisions between runs | Unreliable results | Unique users and data per test, independent tests |
| API behaviour differs from the documentation | Wrong expectations | Verify against real responses; log differences as findings |
| Too much scope for the available time | Project not finished | Build in the priority order below; P3 tests are the first to drop |

---

## 10. Deliverables

1. GitHub repository with the automation framework and tests
2. This test plan
3. README with setup and run instructions
4. Playwright HTML report (screenshot included in the README)
5. GitHub Actions workflow with a status badge
6. A short list of defects or observations found in the application (if any)

---

## 11. Build Order

1. **Framework skeleton:** folder structure, config, `.env`, base fixtures
2. **Authentication:** registration and login (API first, then UI), saved session
3. **Products:** API tests, then UI listing, search, filters and sorting
4. **Cart:** API tests, then UI
5. **Checkout and order history:** API tests, then UI
6. **Hybrid and end-to-end tests**
7. **Contact form, account and remaining P2/P3 tests**
8. **Non-functional checks:** cross-browser, responsive, accessibility
9. **CI pipeline, reporting and README polish**

After step 6, the project is strong enough to put on a CV and start applying, while steps 7 to 9 are completed.