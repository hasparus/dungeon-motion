import { expect, test } from "@playwright/test";

// Scope queries to form to avoid Astro dev toolbar conflicts
const form = "form";

test.beforeEach(async ({ page }) => {
  // Disable Y.js multiplayer — its form observer interferes with fill()
  await page.addInitScript(() => {
    Object.assign(globalThis, { __PW_TEST__: true });
  });
  await page.goto("/character-sheet");
  await page.waitForSelector('body[data-hydrated="true"]');
  // Clear all app storage for test isolation
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("dungeon-motion")) localStorage.removeItem(key);
    }
  });
  await page.reload();
  await page.waitForSelector('body[data-hydrated="true"]');
});

test.describe("Character Sheet", () => {
  test("renders all form sections", async ({ page }) => {
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Look")).toBeVisible();
    await expect(page.getByLabel("Background")).toBeVisible();
    await expect(page.getByLabel("Level")).toBeVisible();
    await expect(page.getByLabel("XP")).toBeVisible();
    await expect(page.getByLabel("Instinct")).toBeVisible();
    await expect(
      page.locator(form).getByText("Attributes", { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator(form).getByText("Supplies", { exact: true }),
    ).toBeVisible();
    await expect(
      page.locator(form).getByRole("heading", { name: "Gear" }),
    ).toBeVisible();
    await expect(
      page.locator(form).getByRole("heading", { name: "Moves" }),
    ).toBeVisible();
  });

  test("renders stat boxes with placeholders", async ({ page }) => {
    const statInputs = page.locator('input[name^="stat-"]');
    await expect(statInputs).toHaveCount(6);
    for (const input of await statInputs.all()) {
      await expect(input).toHaveAttribute("placeholder", "+0");
    }
  });

  test("renders combat shapes (HP, Armor, Damage)", async ({ page }) => {
    await expect(page.locator(form).getByText("HP")).toBeVisible();
    await expect(page.locator(form).getByText("Armor")).toBeVisible();
    await expect(page.locator(form).getByText("Damage")).toBeVisible();
    await expect(page.locator('input[name="hp"]')).toBeVisible();
    await expect(page.locator('input[name="armor"]')).toBeVisible();
    await expect(page.locator('input[name="damage"]')).toBeVisible();
  });

  test("renders debility checkboxes", async ({ page }) => {
    for (const debility of ["weakened", "dazed", "miserable"]) {
      await expect(
        page.locator(`input[name="debility-${debility}"]`),
      ).toBeVisible();
      await expect(page.locator(form).getByText(debility)).toBeVisible();
    }
  });

  test("renders supply checkboxes", async ({ page }) => {
    await expect(
      page.locator('input[name^="supply-rations-"]'),
    ).toHaveCount(3);
    await expect(
      page.locator('input[name^="supply-bandages-"]'),
    ).toHaveCount(3);
    await expect(page.locator('input[name^="supply-ammo-"]')).toHaveCount(3);
    await expect(
      page.locator('input[name^="supply-adventuring-gear-"]'),
    ).toHaveCount(5);
  });

  test("renders move slots with checkboxes", async ({ page }) => {
    await expect(page.locator('input[name^="move-check-"]')).toHaveCount(8);
    await expect(page.locator('textarea[name^="move-name-"]')).toHaveCount(8);
  });

  test("text inputs are editable", async ({ page }) => {
    const nameInput = page.getByLabel("Name");
    await nameInput.fill("Thorgrim");
    await expect(nameInput).toHaveValue("Thorgrim");

    const lookInput = page.getByLabel("Look");
    await lookInput.fill("Scarred dwarf");
    await expect(lookInput).toHaveValue("Scarred dwarf");
  });

  test("checkboxes are toggleable", async ({ page }) => {
    const checkbox = page.locator('input[name="debility-weakened"]');
    await expect(checkbox).not.toBeChecked();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  });
});

test.describe("Form Persistence", () => {
  test("text fields persist across reloads", async ({ page }) => {
    await page.getByLabel("Name").fill("Elara");
    await page.getByLabel("Look").fill("Tall elf");

    // Wait for debounced save
    await page.waitForTimeout(500);
    await page.reload();

    await expect(page.getByLabel("Name")).toHaveValue("Elara");
    await expect(page.getByLabel("Look")).toHaveValue("Tall elf");
  });

  test("checkbox state persists across reloads", async ({ page }) => {
    const checkbox = page.locator('input[name="debility-weakened"]');
    await checkbox.check();

    await page.waitForTimeout(100);
    await page.reload();

    await expect(
      page.locator('input[name="debility-weakened"]'),
    ).toBeChecked();
  });
});

test.describe("Save / Load", () => {
  test("save requires a character name", async ({ page }) => {
    await page.getByRole("button", { name: /save/i }).click();

    const options = page.locator(`${form} select option`);
    await expect(options).toHaveCount(1);
  });

  test("save and load a character", async ({ page }) => {
    await page.getByLabel("Name").fill("Grunk");
    await page.getByLabel("Look").fill("Big orc");
    await page.locator('input[name="stat-str"]').fill("+2");

    await page.getByRole("button", { name: /save/i }).click();

    // Button should flash "Saved"
    await expect(page.getByRole("button", { name: /saved/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /save/i })).toBeVisible({
      timeout: 3000,
    });

    // Clear form
    await page.getByLabel("Name").fill("Someone else");
    await page.getByLabel("Look").fill("");

    // Load Grunk
    const select = page.locator(`${form} select`);
    await select.selectOption("Grunk");

    await expect(page.getByLabel("Name")).toHaveValue("Grunk");
    await expect(page.getByLabel("Look")).toHaveValue("Big orc");
    await expect(page.locator('input[name="stat-str"]')).toHaveValue("+2");
  });

  test("multiple characters can be saved and loaded", async ({ page }) => {
    // Save first character
    await page.getByLabel("Name").fill("Alice");
    await page.getByRole("button", { name: /save/i }).click();
    await page.waitForTimeout(100);

    // Save second character
    await page.getByLabel("Name").fill("Bob");
    await page.getByRole("button", { name: /save/i }).click();
    await page.waitForTimeout(100);

    // Both should appear in Load dropdown
    const select = page.locator(`${form} select`);
    await select.focus();
    const options = select.locator("option");
    // Default "Load" + Alice + Bob
    await expect(options).toHaveCount(3);
  });
});

test.describe("Portrait Canvas", () => {
  test("drawing creates strokes", async ({ page }) => {
    const canvas = page.locator("svg.touch-none");
    const box = await canvas.boundingBox();
    if (!box) throw new Error("Canvas not found");

    // No clear button initially
    await expect(page.getByTitle("Clear portrait")).not.toBeVisible();

    // Draw a stroke
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.down();
    await page.mouse.move(box.x + 60, box.y + 60, { steps: 5 });
    await page.mouse.up();

    // Stroke should be rendered as a path
    await expect(canvas.locator("path")).toHaveCount(1);

    // Clear button should appear
    await expect(page.getByTitle("Clear portrait")).toBeVisible();
  });

  test("clear button removes all strokes", async ({ page }) => {
    const canvas = page.locator("svg.touch-none");
    const box = await canvas.boundingBox();
    if (!box) throw new Error("Canvas not found");

    // Draw a stroke
    await page.mouse.move(box.x + 20, box.y + 20);
    await page.mouse.down();
    await page.mouse.move(box.x + 60, box.y + 60, { steps: 5 });
    await page.mouse.up();

    await page.getByTitle("Clear portrait").click();
    await expect(canvas.locator("path")).toHaveCount(0);
  });
});
