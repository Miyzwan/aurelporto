import { expect, test } from "@playwright/test";

const PUBLIC_ROUTES = [
  "/",
  "/projects",
  "/projects/menavigasi-batavia",
  "/services",
  "/process",
  "/about",
  "/explorations",
  "/contact",
];

test.describe("public site", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} renders without a critical console error`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(String(error)));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });

      const response = await page.goto(route);
      expect(response?.ok()).toBe(true);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test("the projects filter is a real navigation", async ({ page }) => {
    await page.goto("/projects");
    await page.getByRole("link", { name: /^Office/ }).click();
    await expect(page).toHaveURL(/category=office/);
    await expect(page.getByRole("article")).toHaveCount(2);
  });

  test("signed-out admin access redirects to login", async ({ page }) => {
    const response = await page.goto("/admin");

    expect(response?.ok()).toBe(true);
    await expect(page).toHaveURL(/\/auth\/login\?next=%2Fadmin/);
    await expect(page.getByRole("heading", { name: "Sign in to continue." })).toBeVisible();
  });

  test("skip link moves focus to the main landmark", async ({ page, isMobile }) => {
    // WebKit on a touch profile does not move focus to links on Tab by
    // default. The skip link is a desktop keyboard affordance, so assert it
    // where a keyboard actually exists.
    test.skip(isMobile === true, "touch profile has no Tab key behaviour for links");

    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  });
});
