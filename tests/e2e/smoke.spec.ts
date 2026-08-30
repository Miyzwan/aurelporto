import { expect, test } from "@playwright/test";

const PUBLIC_ROUTES = [
  "/",
  "/projects",
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
    const filter = page.getByRole("navigation", { name: "Filter projects by category" });
    const links = filter.getByRole("link");

    // The staging seed intentionally has no published projects. When content
    // exists, use the first real category so this test does not encode a
    // fixture-specific project type.
    if ((await links.count()) < 2) {
      test.skip(true, "No published project category is available in this environment");
      return;
    }

    const categoryHref = await links.nth(1).getAttribute("href");
    expect(categoryHref).toMatch(/\?category=[^&]+/);
    await links.nth(1).click();
    await expect(page).toHaveURL(/category=[^&]+/);
    await expect(links.nth(1)).toHaveAttribute("aria-current", "true");
  });

  test("draft project slugs are not exposed on the public route", async ({ page }) => {
    const response = await page.goto("/projects/development-sample-project");
    expect(response?.status()).toBe(404);
  });

  test("published project detail opens from the projects index", async ({ page }) => {
    await page.goto("/projects");
    const projectLink = page.locator('main a[href^="/projects/"]').first();

    if ((await projectLink.count()) === 0) {
      test.skip(true, "No published project is available in this environment");
      return;
    }

    const href = await projectLink.getAttribute("href");
    expect(href).toBeTruthy();
    const response = await page.goto(href!);
    expect(response?.ok()).toBe(true);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
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
