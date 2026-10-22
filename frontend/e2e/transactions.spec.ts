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

test("En användare kan logga in och sätta in pengar", async ({ page }) => {
  const username = `banktest_${Date.now()}`;
  const password = "test123";

  await page.goto("/register");
  await page.getByLabel("Användarnamn").fill(username);
  await page.getByLabel("Lösenord").fill(password);
  await page.getByRole("button", { name: "Skapa användare" }).click();

  await expect(page.getByText("Användaren har skapats")).toBeVisible();

  await page.goto("/login");
  await page.getByLabel("Användarnamn").fill(username);
  await page.getByLabel("Lösenord").fill(password);
  await page.getByRole("button", { name: "Logga in" }).click();

  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByText("Saldo: 0 kr")).toBeVisible();

  await page.getByLabel("Belopp").fill("200");
  await page.getByRole("button", { name: "Sätt in pengar" }).click();

  await expect(page.getByText("Saldo: 200 kr")).toBeVisible();

  await page
    .getByRole("link", {
      name: "Visa transaktionshistorik",
    })
    .click();

  await expect(page).toHaveURL(/\/transactions$/);
  await expect(page.getByText("200 kr")).toBeVisible();
});
