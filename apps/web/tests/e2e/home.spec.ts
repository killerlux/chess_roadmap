import { expect, test } from "@playwright/test";

const heroHeading = "Build chess mastery one deliberate step at a time.";

test.describe("home page", () => {
  test("displays hero copy and navigation links", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Chess Roadmap/i);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      heroHeading,
    );
    await expect(
      page.getByRole("link", { name: "Preview roadmap outline" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Browse curated resources" }),
    ).toBeVisible();
  });

  test("renders roadmap preview tiles for each stage", async ({ page }) => {
    await page.goto("/#roadmap");

    const stages = ["Beginner", "Improver", "Intermediate", "Advanced"];
    for (const label of stages) {
      const heading = page.getByRole("heading", { level: 3, name: label });
      await expect(heading).toBeVisible();
    }

    const firstPreviewCard = page
      .locator("section#roadmap")
      .getByRole("article")
      .first();
    await expect(firstPreviewCard).toBeVisible();
  });

  test("lists practice benchmarks", async ({ page }) => {
    await page.goto("/#roadmap");

    const benchmarks = page.getByRole("heading", {
      level: 2,
      name: "Practice benchmarks",
    });
    await expect(benchmarks).toBeVisible();

    const benchmarkSection = benchmarks.locator("xpath=ancestor::section[1]");
    const checklistItems = benchmarkSection.getByRole("listitem");
    await expect(checklistItems.first()).toBeVisible();
  });

  test("shows featured resource summaries", async ({ page }) => {
    await page.goto("/#resources");

    const featuredHeading = page.getByRole("heading", {
      level: 2,
      name: "Featured CC0 resources",
    });
    await expect(featuredHeading).toBeVisible();

    const resourceCards = page
      .locator("section#resources")
      .getByRole("listitem");
    await expect(resourceCards.first()).toBeVisible();
  });
});
