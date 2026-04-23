import { expect, test } from '@playwright/test';

async function resetEditor(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    localStorage.setItem('dungeon-motion-editor-document-v3', '<p><br></p>');
    localStorage.setItem('dungeon-motion-editor-spellcheck', 'true');
  });

  await page.reload();
  await page.waitForLoadState('networkidle');

  const editor = page.getByRole('textbox', { name: 'Editor' });
  await expect(editor).toBeVisible();
  await expect(page.locator('button[aria-label]')).toBeVisible();
  await editor.click();
  return editor;
}

test.describe('/editor', () => {
  test('converts markdown heading and list triggers on Enter', async ({ page }) => {
    const stamp = Date.now();
    const heading = `Heading ${stamp}`;
    const bullet = `Bullet ${stamp}`;

    await page.goto('/editor');

    const editor = await resetEditor(page);
    await editor.type(`# ${heading}`);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();

    await editor.type(`- ${bullet}`);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listitem').first()).toHaveText(bullet);
  });

  test('converts bold markdown into a strong tag', async ({ page }) => {
    const stamp = Date.now();
    const bold = `bold-${stamp}`;

    await page.goto('/editor');

    const editor = await resetEditor(page);
    await editor.pressSequentially(`Use **${bold}**`);

    await expect(page.locator('strong')).toHaveText(bold);
    await expect(page.getByText(`Use ${bold}`)).toBeVisible();
  });

  test('converts underscore markdown into an italic tag', async ({ page }) => {
    const stamp = Date.now();
    const italics = `italics-${stamp}`;

    await page.goto('/editor');

    const editor = await resetEditor(page);
    await editor.pressSequentially(`Use _${italics}_.`);

    await expect(page.locator('i')).toHaveText(`${italics}.`);
    await expect(page.getByText(`Use ${italics}.`)).toBeVisible();
  });

  test('preserves earlier bold when later inline markdown is typed in the same paragraph', async ({ page }) => {
    const stamp = Date.now();
    const bold = `bold-${stamp}`;
    const italics = `italics-${stamp}`;

    await page.goto('/editor');

    const editor = await resetEditor(page);
    await editor.pressSequentially(`Use **${bold}**`);
    await expect(page.locator('strong')).toHaveText(bold);

    await editor.pressSequentially(` and _${italics}_.`);
    await expect(page.locator('strong')).toHaveText(bold);
    await expect(page.locator('i')).toHaveText(`${italics}.`);
    await expect(page.getByText(`Use ${bold} and ${italics}.`)).toBeVisible();
  });

  test('persists editor contents across reload', async ({ page }) => {
    const stamp = Date.now();
    const heading = `Saved heading ${stamp}`;
    const body = `Saved body line ${stamp}.`;

    await page.goto('/editor');

    const editor = await resetEditor(page);
    await editor.type(`# ${heading}`);
    await page.keyboard.press('Enter');
    await editor.type(body);

    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect(page.getByText(body)).toBeVisible();
  });

  test('toggles spellcheck from the bottom button', async ({ page }) => {
    await page.goto('/editor');

    const editor = await resetEditor(page);
    const offButton = page.getByRole('button', { name: 'Turn spellcheck off' });
    const onButton = page.getByRole('button', { name: 'Turn spellcheck on' });

    await expect(offButton).toBeVisible();
    await expect(editor).toHaveAttribute('spellcheck', 'true');
    await expect(async () => {
      const value = await editor.evaluate((node) => (node as HTMLDivElement).spellcheck);
      expect(value).toBe(true);
    }).toPass();

    await offButton.click();

    await expect(onButton).toBeVisible();
    await expect(editor).toHaveAttribute('spellcheck', 'false');
    await expect(async () => {
      const value = await editor.evaluate((node) => (node as HTMLDivElement).spellcheck);
      expect(value).toBe(false);
    }).toPass();
  });

  test('captures a spellcheck screenshot flow with gibberish after two button presses', async ({ page }) => {
    await page.goto('/editor');

    const editor = await resetEditor(page);
    const offButton = page.getByRole('button', { name: 'Turn spellcheck off' });
    const onButton = page.getByRole('button', { name: 'Turn spellcheck on' });
    const gibberish = 'blorpt snargle wozzle frimpt drazz';

    await offButton.click();
    await expect(onButton).toBeVisible();
    await onButton.click();
    await expect(offButton).toBeVisible();

    await editor.click();
    await editor.pressSequentially(gibberish);
    await expect(page.getByText(gibberish)).toBeVisible();

    await expect(page.locator('main')).toHaveScreenshot('editor-spellcheck-gibberish.png', {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    });
  });
});
