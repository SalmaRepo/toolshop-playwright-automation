import { Page, Locator, expect } from "@playwright/test";
import { FiltersComponent } from "../components/FiltersComponent";
import { PaginationComponent } from "../components/PaginationComponent";
import { ProductDetailsPage } from "./ProductDetailPage";
import { ProductListingPage } from "./ProductListingPage";
import { HeaderComponent } from "../components/HeaderComponent";

export class CartPage {
  readonly page: Page;
  readonly filters: FiltersComponent;
  readonly pagination: PaginationComponent;
  readonly details: ProductDetailsPage;
  readonly list: ProductListingPage;
  readonly header: HeaderComponent;
  readonly itemName: Locator;
  readonly itemPrice: Locator;
  readonly itemQuantity: Locator;
  readonly itemTotal: Locator;
  readonly cartTotal: Locator;
  readonly removeItem: Locator;
  readonly activeCartTitle: Locator;
  readonly quantityUpdatedMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filters = new FiltersComponent(page);
    this.pagination = new PaginationComponent(page);
    this.details = new ProductDetailsPage(page);
    this.list = new ProductListingPage(page);
    this.header = new HeaderComponent(page);
    this.itemName = page.locator("[data-test='product-title']");
    this.itemQuantity = page.locator("[data-test='product-quantity']");
    this.itemPrice = page.locator("[data-test='product-price']");
    this.itemTotal = page.locator("[data-test='line-price']");
    this.cartTotal = page.locator("[data-test='cart-total']");
    this.removeItem = page.locator(".btn-danger");
    this.activeCartTitle = page.locator(".current");
    this.quantityUpdatedMessage = page.locator("#toast-container");
  }

  async navigateToCartPage() {
    await this.page.goto("/checkout");
  }

  async clickAddToCart() {
    await this.details.addToCart.click();
  }

  async getInstockLinks() {
    await this.list.navigateToProductsPage();
    await this.list.waitForProducts();
    await expect
  .poll(async () => {
    const all = await this.list.productCards.count();
    const withLink = await this.list.page.locator(".card[href]").count();
    return all > 0 && all === withLink;
  })
  .toBe(true);
    const cards = this.list.productCards.filter({
      hasNot: this.list.page.locator("[data-test='out-of-stock']"),
    });
    await this.list.waitForProducts();
    const productLinks = await Promise.all(
      (await cards.all()).map((card) => card.getAttribute("href")),
    );
    return productLinks;
  }

  async addProductToCart(linknumber: number) {
    const productLinks = await this.getInstockLinks();
    await this.page.goto(`${productLinks[linknumber]}`);
    await this.details.addToCart.click();
    await expect(this.details.addedToCartMessage).toContainText(
      "Product added to shopping cart.",
    );
  }

async openCart() {
  await expect(this.header.cart).toBeVisible();
  await this.header.cart.click();
  await expect(this.page).toHaveURL("/checkout");
}

async removeItemFromCart(){
    const initialCount = await this.itemName.count();

  await this.removeItem.last().click();

  await expect(this.itemName).toHaveCount(initialCount - 1);
}

async itemsCountInCart(){
  return await this.itemName.count()
}


}

