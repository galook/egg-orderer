import { test, expect } from "@playwright/test";

test("loads the landing UI", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Egg Orderer" })).toBeVisible();
  await expect(page.getByText("Order window")).toBeVisible();
  await expect(page.getByRole("button", { name: "Join breakfast" })).toBeVisible();
  await expect(page.getByLabel("Name")).toBeVisible();
});

test("toggles sound cues", async ({ page }) => {
  await page.goto("/");

  const switchButton = page.getByRole("switch");
  const initial = await switchButton.getAttribute("aria-checked");

  await switchButton.click();
  const next = await switchButton.getAttribute("aria-checked");

  expect(next).not.toBe(initial);
});
