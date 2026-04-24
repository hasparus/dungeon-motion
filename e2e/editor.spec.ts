import { expect, type Page, test } from '@playwright/test';

const STORAGE_KEY = 'dungeon-motion-editor-document-v3';
const SPELLCHECK_KEY = 'dungeon-motion-editor-spellcheck';

async function resetEditor(page: Page) {
  await page.evaluate(([docKey, spellKey]) => {
    localStorage.setItem(docKey, '<p><br></p>');
    localStorage.setItem(spellKey, 'true');
  }, [STORAGE_KEY, SPELLCHECK_KEY]);

  await page.reload();

  const editor = page.getByRole('textbox', { name: 'Editor' });
  await expect(editor).toBeVisible();
  await expect(page.locator('button[aria-label]')).toBeVisible();
  await editor.click();
  return editor;
}

// Seed localStorage before the page loads so DungeonEditor's mount-effect
// reads the payload. Also plants a canary that dangerous HTML can flip.
async function seedDocument(page: Page, html: string) {
  await page.addInitScript(
    ({ key, payload }) => {
      localStorage.setItem(key, payload);
      (globalThis as unknown as { __xss: boolean }).__xss = false;
    },
    { key: STORAGE_KEY, payload: html },
  );
}

// Dispatches a paste event with HTML on the editor. If no handler calls
// preventDefault, falls back to execCommand('insertHTML') to mimic the
// browser's default paste behavior — so tests catch the "no handler" state.
async function simulateHtmlPaste(editor: ReturnType<Page['locator']>, html: string) {
  await editor.evaluate((el, payload) => {
    const dt = new DataTransfer();
    dt.setData('text/html', payload);
    dt.setData('text/plain', payload.replaceAll(/<[^>]+>/g, ''));
    const event = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: dt,
    });
    el.dispatchEvent(event);
    if (!event.defaultPrevented) {
      document.execCommand('insertHTML', false, payload);
    }
  }, html);
}

// Plain text paste: only text/plain set on the clipboard — no text/html.
async function simulatePlainPaste(editor: ReturnType<Page['locator']>, text: string) {
  await editor.evaluate((el, payload) => {
    const dt = new DataTransfer();
    dt.setData('text/plain', payload);
    const event = new ClipboardEvent('paste', {
      bubbles: true,
      cancelable: true,
      clipboardData: dt,
    });
    el.dispatchEvent(event);
  }, text);
}

test.describe('/editor', () => {
  test('converts markdown heading and list triggers on Enter', async ({ page }) => {
    const stamp = Date.now();
    const heading = `Heading ${stamp}`;
    const bullet = `Bullet ${stamp}`;

    await page.goto('/editor');

    const editor = await resetEditor(page);
    await editor.pressSequentially(`# ${heading}`);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();

    await editor.pressSequentially(`- ${bullet}`);
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
    await editor.pressSequentially(`# ${heading}`);
    await page.keyboard.press('Enter');
    await editor.pressSequentially(body);

    await page.reload();

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
    expect(await editor.evaluate((node) => (node as HTMLDivElement).spellcheck)).toBe(true);

    await offButton.click();

    await expect(onButton).toBeVisible();
    await expect(editor).toHaveAttribute('spellcheck', 'false');
    expect(await editor.evaluate((node) => (node as HTMLDivElement).spellcheck)).toBe(false);
  });

  test('captures a spellcheck screenshot flow with gibberish after two button presses', async ({ page }) => {
    test.skip(process.platform !== 'darwin', 'font rendering varies across platforms; darwin-only baseline');

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

test.describe('/editor — security: localStorage sanitization', () => {
  test('strips <img onerror> payload from saved HTML on load', async ({ page }) => {
    await seedDocument(
      page,
      '<p>canary <img src="x" onerror="globalThis.__xss = true"> tail</p>',
    );
    await page.goto('/editor');

    const editor = page.getByRole('textbox', { name: 'Editor' });
    await expect(editor).toBeVisible();
    await expect(editor.getByText('canary')).toBeVisible();
    await expect(editor.locator('img')).toHaveCount(0);
    expect(await page.evaluate(() => (globalThis as unknown as { __xss: boolean }).__xss)).toBe(false);
  });

  test('strips <script> tags from saved HTML on load', async ({ page }) => {
    await seedDocument(
      page,
      '<p>before<script>globalThis.__xss = true</script>after</p>',
    );
    await page.goto('/editor');

    const editor = page.getByRole('textbox', { name: 'Editor' });
    await expect(editor).toBeVisible();
    await expect(editor.getByText(/before.*after/)).toBeVisible();
    await expect(editor.locator('script')).toHaveCount(0);
    expect(await page.evaluate(() => (globalThis as unknown as { __xss: boolean }).__xss)).toBe(false);
  });

  test('drops disallowed tags but keeps their text content', async ({ page }) => {
    await seedDocument(
      page,
      '<div style="color:red">hello<iframe src="about:blank"></iframe> world</div>',
    );
    await page.goto('/editor');

    const editor = page.getByRole('textbox', { name: 'Editor' });
    await expect(editor).toBeVisible();
    await expect(editor).toContainText('hello');
    await expect(editor).toContainText('world');
    await expect(editor.locator('div')).toHaveCount(0);
    await expect(editor.locator('iframe')).toHaveCount(0);
  });

  test('preserves allowlisted tags across reload', async ({ page }) => {
    await seedDocument(
      page,
      '<h1>Title</h1><p>Text with <strong>bold</strong> and <i>italic</i>.</p><ul><li>bullet</li></ul><ol><li>numbered</li></ol>',
    );
    await page.goto('/editor');

    const editor = page.getByRole('textbox', { name: 'Editor' });
    await expect(editor.getByRole('heading', { level: 1, name: 'Title' })).toBeVisible();
    await expect(editor.locator('strong')).toHaveText('bold');
    await expect(editor.locator('i')).toHaveText('italic');
    await expect(editor.locator('ul > li')).toHaveText('bullet');
    await expect(editor.locator('ol > li')).toHaveText('numbered');
  });
});

test.describe('/editor — security: paste sanitization', () => {
  test('paste with <img onerror> inserts text only, no img', async ({ page }) => {
    await page.goto('/editor');
    const editor = await resetEditor(page);

    await simulateHtmlPaste(
      editor,
      'before<img src="x" onerror="globalThis.__xss = true">after',
    );

    await expect(editor.locator('img')).toHaveCount(0);
    expect(await page.evaluate(() => (globalThis as unknown as { __xss: boolean }).__xss ?? false)).toBe(false);
    await expect(editor).toContainText('before');
    await expect(editor).toContainText('after');
  });

  test('paste with <script> strips the script tag', async ({ page }) => {
    await page.goto('/editor');
    const editor = await resetEditor(page);

    await simulateHtmlPaste(
      editor,
      'before<script>globalThis.__xss = true</script>after',
    );

    await expect(editor.locator('script')).toHaveCount(0);
    expect(await page.evaluate(() => (globalThis as unknown as { __xss: boolean }).__xss ?? false)).toBe(false);
    await expect(editor).toContainText('before');
    await expect(editor).toContainText('after');
  });

  test('paste preserves allowlisted inline marks (strong, i)', async ({ page }) => {
    await page.goto('/editor');
    const editor = await resetEditor(page);

    await simulateHtmlPaste(editor, '<strong>keep-bold</strong> and <i>keep-italic</i>');

    await expect(editor.locator('strong')).toHaveText('keep-bold');
    await expect(editor.locator('i')).toHaveText('keep-italic');
  });

  test('paste of plain text inserts at caret', async ({ page }) => {
    await page.goto('/editor');
    const editor = await resetEditor(page);

    await simulateHtmlPaste(editor, 'plain paste content');

    await expect(editor).toContainText('plain paste content');
    await expect(editor.locator('img,script,iframe,style')).toHaveCount(0);
  });

  test('paste with block elements splits current paragraph', async ({ page }) => {
    await page.goto('/editor');
    const editor = await resetEditor(page);

    await editor.pressSequentially('start middle end');
    // Move caret to between "middle" and " end"
    for (const _ of ' end') {
      await page.keyboard.press('ArrowLeft');
    }

    await simulateHtmlPaste(editor, '<h1>Injected</h1><p>body text</p>');

    // Heading must exist and must NOT be nested inside a paragraph.
    await expect(editor.getByRole('heading', { level: 1, name: 'Injected' })).toBeVisible();
    await expect(editor.locator('p h1, p h2')).toHaveCount(0);
    // Body paragraph from paste.
    await expect(editor.locator('p', { hasText: 'body text' })).toBeVisible();
    // Tail after the original split is still present.
    await expect(editor).toContainText(' end');
  });

  test('paste with block elements into a list item inserts after the list (not inside)', async ({ page }) => {
    await seedDocument(page, '<p>before</p><ul><li>alpha</li><li>beta</li></ul><p>after</p>');
    await page.goto('/editor');

    const editor = page.getByRole('textbox', { name: 'Editor' });
    await expect(editor).toBeVisible();
    await editor.locator('li').first().click();

    await simulateHtmlPaste(editor, '<h1>Injected</h1>');

    // Heading must NOT be inside any list.
    await expect(editor.locator('ul h1, ol h1')).toHaveCount(0);
    await expect(editor.getByRole('heading', { level: 1, name: 'Injected' })).toBeVisible();
    // Both list items preserved.
    await expect(editor.locator('ul li')).toHaveCount(2);
  });

  test('sanitizer removes <script> nested inside <svg>', async ({ page }) => {
    await seedDocument(
      page,
      '<p>before<svg><script>globalThis.__xss = true</script></svg>after</p>',
    );
    await page.goto('/editor');

    const editor = page.getByRole('textbox', { name: 'Editor' });
    await expect(editor).toBeVisible();
    await expect(editor).toContainText(/before/);
    await expect(editor).toContainText(/after/);
    // Neither the <svg>/<script> elements nor the script *source text*
    // should end up in the document.
    await expect(editor.locator('svg, script')).toHaveCount(0);
    await expect(editor).not.toContainText('globalThis.__xss');
    expect(await page.evaluate(() => (globalThis as unknown as { __xss: boolean }).__xss)).toBe(false);
  });

  test('plain text paste preserves line breaks', async ({ page }) => {
    await page.goto('/editor');
    const editor = await resetEditor(page);

    await simulatePlainPaste(editor, 'line one\nline two\nline three');

    await expect(editor).toContainText('line one');
    await expect(editor).toContainText('line two');
    await expect(editor).toContainText('line three');
    // Two <br> separators for three lines.
    const brCount = await editor.evaluate((el) => el.querySelectorAll('br').length);
    expect(brCount).toBeGreaterThanOrEqual(2);
  });
});

test.describe('/editor — Enter semantics', () => {
  test('Enter does not destroy content when caret is before the markdown prefix', async ({ page }) => {
    // Caret inside <strong>, whose text is BEFORE the "# head" text node.
    // Heading conversion must not run (caret is before the prefix), and
    // the original content must be preserved.
    await seedDocument(page, '<p><strong>bold</strong># head</p>');
    await page.goto('/editor');

    const editor = page.getByRole('textbox', { name: 'Editor' });
    await expect(editor).toBeVisible();
    await editor.locator('strong').click();

    await page.keyboard.press('Enter');

    await expect(editor).toBeVisible();
    await expect(editor).toContainText('bold');
    await expect(editor).toContainText('head');
    // "# " must not have been silently deleted.
    await expect(editor).toContainText('#');
  });

  test('Enter preserves inline formatting when converting a heading', async ({ page }) => {
    await page.goto('/editor');
    const editor = await resetEditor(page);

    await editor.pressSequentially('# hello **world**');
    // Inline transform wraps ** in <strong> before Enter is pressed.
    await expect(editor.locator('strong')).toHaveText('world');

    await page.keyboard.press('Enter');

    await expect(editor.locator('h1')).toBeVisible();
    await expect(editor.locator('h1 strong')).toHaveText('world');
  });

  test('mid-paragraph Enter on heading marker preserves text after caret', async ({ page }) => {
    await page.goto('/editor');
    const editor = await resetEditor(page);

    await editor.pressSequentially('# head tail');
    // Move caret to just after "head" (before the space+tail)
    for (const _ of ' tail') {
      await page.keyboard.press('ArrowLeft');
    }
    await page.keyboard.press('Enter');

    await expect(editor.getByRole('heading', { level: 1, name: 'head' })).toBeVisible();
    await expect(editor).toContainText('tail');
    // And "tail" must not be inside the heading.
    await expect(editor.getByRole('heading', { level: 1 })).not.toContainText('tail');
  });
});

test.describe('/editor — caret preservation', () => {
  test('spellcheck toggle preserves caret position', async ({ page }) => {
    await page.goto('/editor');
    const editor = await resetEditor(page);

    await editor.pressSequentially('hello world');
    // Move caret back 6 chars: caret now between "hello" and " world"
    for (const _ of ' world') {
      await page.keyboard.press('ArrowLeft');
    }

    const before = await page.evaluate(() => {
      const s = globalThis.getSelection();
      return {
        offset: s?.anchorOffset ?? -1,
        text: s?.anchorNode?.textContent ?? '',
      };
    });

    await page.getByRole('button', { name: 'Turn spellcheck off' }).click();
    await expect(page.getByRole('button', { name: 'Turn spellcheck on' })).toBeVisible();

    const after = await page.evaluate(() => {
      const s = globalThis.getSelection();
      return {
        offset: s?.anchorOffset ?? -1,
        text: s?.anchorNode?.textContent ?? '',
      };
    });

    expect(after).toEqual(before);
  });
});
