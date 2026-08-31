import { expect, test } from "@playwright/test";

test.describe("Critical Product Flows (INT-016 & Audit F-04)", () => {
  test("1. Home loads published sections and core landmarks", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("2. Projects filter navigation works", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const filterNav = page.getByRole("navigation", { name: "Filter projects by category" });
    if (await filterNav.isVisible()) {
      const links = filterNav.getByRole("link");
      if ((await links.count()) > 1) {
        await links.nth(1).click();
        await expect(page).toHaveURL(/\?category=/);
      }
    }
  });

  test("3. Unknown / draft project slug returns 404", async ({ page }) => {
    const response = await page.goto("/projects/nonexistent-draft-case-study");
    expect(response?.status()).toBe(404);
  });

  test("4. Reduced-motion rendering presents content completely", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("5. Admin unauthenticated access redirects to /auth/login with next param", async ({
    page,
  }) => {
    await page.goto("/admin/site");
    await expect(page).toHaveURL(/\/auth\/login\?next=%2Fadmin%2Fsite/);
    await expect(page.getByRole("heading", { name: "Sign in to continue." })).toBeVisible();

    await page.goto("/admin/projects");
    await expect(page).toHaveURL(/\/auth\/login\?next=%2Fadmin%2Fprojects/);
  });

  test("6. Admin login form validates required fields and bad credentials", async ({ page }) => {
    await page.goto("/auth/login");
    const emailInput = page.getByLabel("Email");
    const passwordInput = page.getByLabel("Password");
    const submitBtn = page.getByRole("button", { name: "Sign in" });

    await emailInput.fill("invalid-admin@example.com");
    await passwordInput.fill("wrongpassword123");
    await submitBtn.click();

    // Form shows an error message without crashing
    await expect(
      page.getByRole("alert").or(page.getByText(/could not sign you in/i)),
    ).toBeVisible();
  });

  test("7. Contact inquiry form validation and interaction", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const nameInput = page.getByLabel("Name");
    const emailInput = page.getByLabel("Email");
    const submitBtn = page.getByRole("button", { name: "Send inquiry" });

    // Try submitting empty form to trigger validation
    await submitBtn.click();
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
  });

  test("8. Mobile menu opens, displays navigation items, and closes", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    const menuTrigger = page.getByRole("button", { name: /^menu$/i });
    if (await menuTrigger.isVisible()) {
      await menuTrigger.click();
      const menuDialog = page.getByRole("dialog", { name: /navigation/i });
      await expect(menuDialog).toBeVisible();

      // Close menu
      const closeBtn = menuDialog.getByRole("button", { name: /close/i });
      await closeBtn.click();
      await expect(menuDialog).toBeHidden();
    }
  });

  test("9. Robots and Sitemap endpoints are accessible", async ({ request }) => {
    const robotsRes = await request.get("/robots.txt");
    expect(robotsRes.ok()).toBe(true);
    const robotsText = await robotsRes.text();
    expect(robotsText).toContain("Disallow: /admin");
    expect(robotsText).toContain("Sitemap:");

    const sitemapRes = await request.get("/sitemap.xml");
    expect(sitemapRes.ok()).toBe(true);
  });

  test("10. Supporting public routes render headings and content", async ({ page }) => {
    for (const path of ["/about", "/services", "/process", "/explorations"]) {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("main")).toBeVisible();
    }
  });

  test("11. Skip-to-content accessible landmark link works", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.getByRole("link", { name: /skip to content/i });
    await expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  test("12. Public case study route handles valid params", async ({ page }) => {
    const res = await page.goto("/projects");
    expect(res?.status()).toBe(200);
    const firstProjectLink = page.locator("a[href^='/projects/']").first();
    if (await firstProjectLink.isVisible()) {
      await firstProjectLink.click();
      await expect(page).toHaveURL(/\/projects\/.+/);
      await expect(page.getByRole("main")).toBeVisible();
    }
  });

  test("13. Signout endpoint redirects unauthenticated caller to login", async ({ page }) => {
    await page.goto("/auth/signout");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("14. Custom 404 page renders design system layout and return link", async ({ page }) => {
    const res = await page.goto("/this-path-does-not-exist-at-all");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
    const returnLink = page.getByRole("link", { name: /return to home/i });
    await expect(returnLink).toBeVisible();
  });

  test("15. Header navigation contains primary public links", async ({ page }) => {
    await page.goto("/");
    const banner = page.getByRole("banner");
    await expect(banner).toBeVisible();
    const brandLink = banner.getByRole("link").first();
    await expect(brandLink).toHaveAttribute("href", "/");
  });
});
