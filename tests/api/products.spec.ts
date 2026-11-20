import { test, expect } from "@playwright/test";
import { API_URL } from "../../utils/env";

test("API-PRD-01: Get product list @P1 @smoke @api", async ({ request }) => {
  // Send GET request
  const response = await request.get(`${API_URL}/products`);

  // Verify status code
  expect(response.status()).toBe(200);

  // Read response body
  const responseBody = await response.json();

  // Print response in terminal
  console.log(JSON.stringify(responseBody, null, 2));
});

test("API-PRD-02: Get a single product by a valid ID: details match the list entry @P1 @smoke @api", async ({
  request,
}) => {
  const productId = "01M7P64BMRPR4XEN6KN37QQVRY";

  const listingResponse = await request.get(`${API_URL}/products`);
  expect(listingResponse.status()).toBe(200);
  const listBody = await listingResponse.json();

  const listedProduct = await listBody.data.find(
    (product: any) => product.id === productId,
  );

  const singleProductResponse = await request.get(
    `${API_URL}/products/${productId}`,
  );
  expect(singleProductResponse.status()).toBe(200);

  const singleProduct = await singleProductResponse.json();

  expect(singleProduct.id).toBe(productId);
  expect(singleProduct.name).toBeTruthy();
  expect(typeof singleProduct.name).toBe("string");
  expect(typeof singleProduct.price).toBe("number");

  expect(singleProduct.name).toBe(listedProduct.name);
  expect(singleProduct.price).toBe(listedProduct.price);
});

//Get a product with a nonexistent ID returns the correct error
test("API-PRD-03:Get a product with a nonexistent ID returns the correct error  @P2 @regression @api", async ({
  request,
}) => {
  const nonExistProductId = "123456789101112";

  const nonExistingProductResponse = await request.get(
    `${API_URL}/products/${nonExistProductId}`,
  );
  expect(nonExistingProductResponse.status()).toBe(404);
  const nonexistingProduct = await nonExistingProductResponse.json();
  expect(nonexistingProduct.message).toBe("Requested item not found");
});

//
test("API-PRD-04:Search products by keyword returns only matching items  @P1 @regression @api", async ({
  request,
}) => {
  const searchKeyword = "plier";
  const pageNumber = 1;
  const response = await request.get(`${API_URL}/products/search`, {
    params: {
      q: searchKeyword,
      page: pageNumber,
    },
  });

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));
  expect(responseBody.current_page).toBe(pageNumber);
  expect(responseBody.total).toBe(responseBody.data.length);
  for (const product of responseBody.data) {
    expect(product.name.toLowerCase()).toContain(searchKeyword);
  }
});

// API-PRD-05	Filter products by category, brand and price range	P2	R
test("API-PRD-05:	Filter products by category, brand and price range	@P2	@Regression @api", async ({
  request,
}) => {
  const categoryId = "01M7Q514DAE9G3W23GTA2H74T7";
  const brandId = "01M7Q513Y4NC7FW53TFVMDCXD0";
  const response = await request.get(`${API_URL}/products`, {
    params: {
      category_id: categoryId,
      brand_id: brandId,
      between: "1,50",
    },
  });

  expect(response.status()).toBe(200);
  const responseProduct = await response.json();
  console.log(responseProduct);
  expect(responseProduct.data.length).toBeGreaterThan(0);

  for (const product of responseProduct.data) {
    expect(product.category.id).toBe(categoryId);
  }
  for (const product of responseProduct.data) {
    expect(product.brand.id).toBe(brandId);
  }
  for (const product of responseProduct.data) {
    expect(product.price).toBeGreaterThanOrEqual(1);
    expect(product.price).toBeLessThanOrEqual(50);
  }
});
//API-PRD-06	Sort products by name and price: order is correct	P2	R
test("API-PRD-06: Sort products by name and price: order is correct	@P2	@Regression @api", async ({
  request,
}) => {
  const sortWays = ["name,asc", "name,desc", "price,asc", "price,desc"];
  for (const way of sortWays) {
    console.log(way);
    const response = await request.get(`${API_URL}/products`, {
      params: {
        sort: way,
      },
    });

    expect(response.status()).toBe(200);
    const responseProduct = await response.json();
    console.log(responseProduct);
    expect(responseProduct.data.length).toBeGreaterThan(0);
    const products = responseProduct.data;

    for (let i = 0; i < products.length - 1; i++) {
      if (way === "name,asc") {
        expect(
          products[i].name.localeCompare(products[i + 1].name),
        ).toBeLessThanOrEqual(0);
      }

      if (way === "name,desc") {
        expect(
          products[i].name.localeCompare(products[i + 1].name),
        ).toBeGreaterThanOrEqual(0);
      }

      if (way === "price,asc") {
        expect(products[i].price).toBeLessThanOrEqual(products[i + 1].price);
      }

      if (way === "price,desc") {
        expect(products[i].price).toBeGreaterThanOrEqual(products[i + 1].price);
      }
    }
  }
});


test("API-PRD-07: Pagination returns correct page size and different pages @P2 @regression @api", async ({ request }) => {

  // Request page 1
  const response1 = await request.get(`${API_URL}/products`, {
    params: { page: 1 }
  });

  expect(response1.status()).toBe(200);

  const page1 = await response1.json();

  // Request page 2
  const response2 = await request.get(`${API_URL}/products`, {
    params: { page: 2 }
  });

  expect(response2.status()).toBe(200);

  const page2 = await response2.json();

  // Verify page numbers
  expect(page1.current_page).toBe(1);
  expect(page2.current_page).toBe(2);

  // Verify page size
  expect(page1.data.length).toBeLessThanOrEqual(page1.per_page);
  expect(page2.data.length).toBeLessThanOrEqual(page2.per_page);

  // Verify both pages contain products
  expect(page1.data.length).toBeGreaterThan(0);
  expect(page2.data.length).toBeGreaterThan(0);

  // Verify different pages return different products
  const page1Ids = page1.data.map((product:any) => product.id);
  const page2Ids = page2.data.map((product:any) => product.id);

  expect(page1Ids).not.toEqual(page2Ids);

});
