import { test, expect } from "@playwright/test";

test("En användare som inte är inloggad kan inte se transaktioner", async ({
  page,
}) => {
  await page.goto("/transactions");

  await expect(
    page.getByText("Du måste logga in för att se dina transaktioner."),
  ).toBeVisible();

  await expect(page.locator("li")).toHaveCount(0);
});

test("En ny användare kan registrera sig", async ({ page }) => {
  const username = `playwright_${Date.now()}`;

  await page.goto("/register");

  await page.getByLabel("Användarnamn").fill(username);
  await page.getByLabel("Lösenord").fill("test123");

  await page.getByRole("button", { name: "Skapa användare" }).click();

  await expect(page.getByText("Användaren har skapats")).toBeVisible();
});
