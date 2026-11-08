import { Page, Locator } from "@playwright/test";

export class ProductDetailsPage {
  readonly page: Page;
  readonly category: Locator;
  readonly brand: Locator;
  readonly name: Locator;
  readonly price: Locator;
  readonly description: Locator;
  readonly image:Locator;
  readonly productIncrease:Locator;
  readonly productDecrease:Locator;
  readonly quantity:Locator;
  readonly addToCart:Locator;
  readonly cartQuantity:Locator;
  readonly addedToCartMessage:Locator;

  constructor(page: Page) {
    this.page = page;
    this.category = page.locator("[aria-label='category']");
    this.brand = page.locator("[aria-label='brand']");
    this.name = page.locator("h1");
    this.price = page.locator("[aria-label='unit-price']");
    this.description = page.locator("#id");
    this.image=page.locator(".figure-img");
    this.productIncrease=page.locator("#btn-increase-quantity");
    this.productDecrease=page.locator("#btn-decrease-quantity");
    this.quantity=page.locator("#quantity-input");
    this.addToCart=page.locator("#btn-add-to-cart");
    this.cartQuantity=page.locator("#lblCartCount");
    this.addedToCartMessage=page.locator("#toast-container")

  }

  async getProductDetailsName() {
    return await this.name.textContent();
  }

  async getProductDetailsPrice() {
    return await this.price.textContent();
  }

  async getProductDetailsDescription() {
    return await this.description.textContent();
  }
  async clickProductIncrease(){
    await this.productIncrease.click();
  }

  async clickProductDecrease(){
    await this.productDecrease.click()
  }

  async getQuantity(){
    return await this.quantity.inputValue()
  }

  async getCartCount(): Promise<number> {
  // No badge on the page means the cart is empty
  if ((await this.cartQuantity.count()) === 0) {
    return 0;
  }
  return Number(await this.cartQuantity.innerText());
}
}
