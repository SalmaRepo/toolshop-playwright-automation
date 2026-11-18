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
    const nonexistingProduct=await nonExistingProductResponse.json();
  expect(nonexistingProduct.message).toBe("Requested item not found")
});


//
test("API-PRD-04:Search products by keyword returns only matching items  @P1 @regression @api", async ({
  request,
}) => {
   const searchKeyword = "plier";
   const pageNumber=1;
   const response = await request.get(
    `${API_URL}/products/search`,
    {
      params: {
        q: searchKeyword,
        page: pageNumber,
      },
    }
  );

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  console.log(JSON.stringify(responseBody, null, 2));
  expect(responseBody.current_page).toBe(pageNumber);
  expect(responseBody.total).toBe(responseBody.data.length);
  for (const product of responseBody.data) {
    expect(product.name.toLowerCase()).toContain(searchKeyword);
  }

});
