import {test,expect} from "@playwright/test"

test("sample",async ({page})=>{
    await page.goto("https://practicesoftwaretesting.com/")
    const handles = page.getByRole("slider");

console.log("Minimum handle:");
console.log("Current:", await handles.nth(0).getAttribute("aria-valuenow"));
console.log("Min:", await handles.nth(0).getAttribute("aria-valuemin"));
console.log("Max:", await handles.nth(0).getAttribute("aria-valuemax"));

console.log("Maximum handle:");
console.log("Current:", await handles.nth(1).getAttribute("aria-valuenow"));
console.log("Min:", await handles.nth(1).getAttribute("aria-valuemin"));
console.log("Max:", await handles.nth(1).getAttribute("aria-valuemax"));

await handles.nth(0).focus();
await page.keyboard.press("ArrowRight");

console.log(
  "Minimum after ArrowRight:",
  await handles.nth(0).getAttribute("aria-valuenow")
);
})

