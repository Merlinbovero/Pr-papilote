import { expect, test } from "@playwright/test";

test.describe("pages de confiance", () => {
  test("le pied de page mène aux pages légales", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("navigation", { name: "Informations légales" });
    await expect(footer.getByRole("link", { name: "Mentions légales" })).toHaveAttribute(
      "href",
      "/mentions-legales"
    );
    await expect(footer.getByRole("link", { name: "Confidentialité" })).toHaveAttribute(
      "href",
      "/confidentialite"
    );
  });

  test("l'avertissement non officiel est présent", async ({ page }) => {
    await page.goto("/mentions-legales");
    await expect(
      page.getByRole("complementary", { name: "Avertissement — projet indépendant" })
    ).toContainText(/non officiel/i);
  });

  test("les quatre pages de confiance répondent", async ({ page }) => {
    for (const path of ["/confidentialite", "/cgu", "/contact"]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });
});
