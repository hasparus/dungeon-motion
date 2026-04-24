# Grumpy Review — `feat/dungeon-motion-editor`

Scope: `git diff origin/main...feat/dungeon-motion-editor`. Focus on the WYSIWYG editor at `/editor`.

## `src/dungeon-editor.tsx`

- **innerHTML restore from localStorage = stored-XSS primitive.** `editor.innerHTML = localStorage.getItem(...)` around line 244. Any same-origin write (devtools, another page, bookmarklet, future script) persists and re-injects. Block.
- **No paste handler.** Browser default paste drops arbitrary HTML into contenteditable, `save()` persists it. Combined with above: stored XSS. Add `onPaste` → `preventDefault` + insert `text/plain`.
- **MutationObserver re-entrancy guard is a no-op.** `running` flag reset in `setTimeout(…, 0)` but `observer.observe` reattaches before the timeout fires. Collapse to a single synchronous flag or drop the observer entirely.
- **Triple redundant normalization.** `onInput`, `onKeyUp`, AND MutationObserver all call `applyInlineTransform + save`. 2–3 saves per keystroke. Pick one.
- **`getCurrentBlock` fallback is wrong.** When selection is outside root, returns `lastElementChild` regardless of caret position. Transforms land on the wrong block; `placeCaretAtEnd` then yanks caret to end of document.
- **Iterating live NodeList while mutating siblings** in `absorbTrailingPunctuation`. Works by accident; snapshot with `Array.from`.
- **Brittle regex.** `\*\*([^*]+)\*\*` breaks on `**foo * bar**`; `_..._` fires mid-word (`foo_bar_baz`).
- **`escapeHtml` missing `'`.** Not exploitable here (no attr writes) but inconsistent.
- **OL unsupported but not prevented** — `<ol>` pasted in bypasses block allowlist at line 39.
- **Spellcheck toggle does `blur()` + rAF `focus()`** — caret slams to editor start every toggle. User-hostile.

## `e2e/editor.spec.ts`

- **Visual snapshot baseline is `chromium-darwin` only.** CI is Linux → font-rendering diff → flake. Gate on darwin or generate a linux baseline.
- **`networkidle` after reload** — Google Fonts makes this flaky. Use `domcontentloaded` + visibility wait.
- **`editor.type` (deprecated) mixed with `pressSequentially`.** Pick one.
- **Spellcheck test `toPass()` retry** hides timing bugs rather than exposing them.
- **Missing tests**: paste, XSS payload persistence, mid-paragraph Enter with caret-not-at-end (does `rawText.slice(2)` eat content after caret? yes), ordered lists.

## `playwright.config.ts`

- `fullyParallel: false` + `workers: 1`: fine, just slow.
- `retries: 2` on CI masks flakes but acceptable given snapshot volatility.
- `reuseExistingServer: true` in CI: foot-gun if :4321 is squatted. Normally gated `!process.env.CI`.

## Surface

- `src/pages/index.astro` links `/editor` from the public homepage while XSS + paste are open. Gate behind a flag or ship sanitization first. Link text doesn't signal "alpha."

## Unresolved

- Threat model: strictly single-user local? Confirm.
- `STORAGE_KEY` has `v3` — migration or surrender? No migration code.

**Verdict: block.** Fix the innerHTML/paste pair, collapse triple normalization, fix `getCurrentBlock` fallback. Then ship.
