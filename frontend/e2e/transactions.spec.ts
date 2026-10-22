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
