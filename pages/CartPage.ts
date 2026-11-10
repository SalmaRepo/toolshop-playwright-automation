import { Page,Locator,expect } from "@playwright/test";
import { FiltersComponent } from "../components/FiltersComponent";
import { PaginationComponent } from "../components/PaginationComponent";
import { ProductDetailsPage } from "./ProductDetailPage";
import { ProductListingPage } from "./ProductListingPage";

export class CartPage{
     readonly page: Page;
     readonly filters: FiltersComponent;
       readonly pagination: PaginationComponent;
       readonly details: ProductDetailsPage;
       readonly list:ProductListingPage;
       readonly itemName:Locator;
       readonly itemPrice:Locator;
       readonly itemQuantity:Locator;
       readonly itemTotal:Locator;
       readonly cartTotal:Locator;
       readonly removeItem:Locator;
       readonly activeCartTitle:Locator;

constructor(page:Page){
    this.page=page;
     this.filters = new FiltersComponent(page);
    this.pagination = new PaginationComponent(page);
    this.details=new ProductDetailsPage(page);
    this.list=new ProductListingPage(page);
    this.itemName=page.locator("[data-test='product-title']");
    this.itemQuantity=page.locator("[data-test='product-quantity']");
    this.itemPrice=page.locator("[data-test='product-price']");
    this.itemTotal=page.locator("[data-test='line-price']");
    this.cartTotal=page.locator("[data-test='cart-total']");
    this.removeItem=page.locator(".btn-danger");
    this.activeCartTitle=page.locator(".current")

}

async navigateToCartPage() {
    await this.page.goto("/checkout");
  }

  async clickAddToCart(){
    await this.details.addToCart.click();
  }


}