import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "dungeon-motion-editor-document-v3";
const SPELLCHECK_KEY = "dungeon-motion-editor-spellcheck";

const DEFAULT_HTML = [
  "<h1>Untitled Expedition</h1>",
  "<p>Start here. Sketch the village, the threat, the omen, the opening scene.</p>",
  "<h2>What everyone knows</h2>",
  "<p>The road is bad. The weather is worse. Something in the hills has started answering back.</p>",
  "<ul><li>A witness saw torchlight where no one lives.</li><li>The chapel bell rang after midnight.</li><li>No one wants to say the old name out loud.</li></ul>",
  "<p>Use <strong>bold</strong> for pressure and <em>italics</em> for whispers.</p>",
].join("");

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const ALLOWED_TAGS = new Set(["BR", "H1", "H2", "I", "LI", "P", "STRONG", "UL"]);
const DROPPED_TAGS = new Set(["IFRAME", "OBJECT", "SCRIPT", "STYLE"]);
const TAG_RENAME: Record<string, string> = { B: "STRONG", EM: "I" };

function sanitizeInto(source: ParentNode, target: ParentNode) {
  for (const child of source.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      target.append(child.cloneNode(false));
      continue;
    }
    if (!(child instanceof Element)) continue;

    const tag = TAG_RENAME[child.tagName] ?? child.tagName;

    if (DROPPED_TAGS.has(tag)) continue;

    if (ALLOWED_TAGS.has(tag)) {
      const el = document.createElement(tag.toLowerCase());
      target.append(el);
      sanitizeInto(child, el);
      continue;
    }

    // Disallowed wrapper: flatten — keep descendant content, drop the tag.
    sanitizeInto(child, target);
  }
}

function sanitizeHtml(html: string): string {
  // <template> content is an inert DocumentFragment — scripts don't run,
  // images don't fetch, event handlers don't fire during parse.
  const template = document.createElement("template");
  template.innerHTML = html;
  const clean = document.createElement("div");
  sanitizeInto(template.content, clean);
  return clean.innerHTML;
}

function formatInline(text: string) {
  return escapeHtml(text)
    .replaceAll(/\*\*([^*]+)\*\*([.,!?])?/g, "<strong>$1$2</strong>")
    .replaceAll(/_([^_]+)_([.,!?])?/g, "<i>$1$2</i>");
}

function normalizeEditableText(text: string) {
  return text.replaceAll("\u200B", "").replaceAll("\u00A0", " ");
}

function getCurrentBlock(root: HTMLElement) {
  const selection = globalThis.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  let node: Node | null = selection.anchorNode;
  while (node && node !== root) {
    if (node instanceof HTMLElement && ["H1", "H2", "LI", "P"].includes(node.tagName)) {
      return node;
    }
    node = node.parentNode;
  }

  const fallback = root.lastElementChild;
  if (!(fallback instanceof HTMLElement)) return null;
  if (["H1", "H2", "LI", "P"].includes(fallback.tagName)) return fallback;

  if (fallback.tagName === "UL" || fallback.tagName === "OL") {
    const item = fallback.lastElementChild;
    if (item instanceof HTMLElement && item.tagName === "LI") return item;
  }

  return null;
}

function placeCaretAtEnd(element: HTMLElement) {
  const selection = globalThis.getSelection();
  if (!selection) return;

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function placeCaretAtStart(element: HTMLElement) {
  const selection = globalThis.getSelection();
  if (!selection) return;

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function getCaretOffsetInBlock(block: HTMLElement): number {
  const selection = globalThis.getSelection();
  if (!selection || selection.rangeCount === 0) return block.textContent?.length ?? 0;
  const range = selection.getRangeAt(0);
  if (!block.contains(range.endContainer)) return block.textContent?.length ?? 0;
  const preRange = document.createRange();
  preRange.selectNodeContents(block);
  preRange.setEnd(range.endContainer, range.endOffset);
  return preRange.toString().length;
}

function splitAtCaret(block: HTMLElement, prefixLength: number) {
  const raw = block.textContent ?? "";
  const offset = Math.max(getCaretOffsetInBlock(block), prefixLength);
  return {
    after: normalizeEditableText(raw.slice(offset)),
    before: normalizeEditableText(raw.slice(prefixLength, offset)),
  };
}

function save(root: HTMLElement) {
  localStorage.setItem(STORAGE_KEY, root.innerHTML.replaceAll("\u200B", ""));
}

function insertCaretMarker(root: HTMLElement) {
  const selection = globalThis.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer)) return null;

  const marker = document.createElement("span");
  marker.dataset.caretMarker = "true";
  marker.setAttribute("contenteditable", "false");
  marker.textContent = "\u200B";
  range.insertNode(marker);
  return marker;
}

function restoreCaretFromMarker(marker: HTMLElement) {
  const parent = marker.parentNode;
  if (!(parent instanceof HTMLElement)) return;

  const boundary = document.createTextNode("\u200B");

  marker.replaceWith(boundary);

  const selection = globalThis.getSelection();
  if (!selection) return;

  const range = document.createRange();
  range.setStart(boundary, 1);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function transformInlineTextNodes(node: Node): boolean {
  let changed = false;

  if (node instanceof Text) {
    const raw = normalizeEditableText(node.textContent ?? "");
    if (!raw.includes("**") && !raw.includes("_")) return false;

    const wrapper = document.createElement("span");
    wrapper.innerHTML = formatInline(raw);

    if (wrapper.textContent === raw && wrapper.children.length === 0) return false;

    node.replaceWith(...wrapper.childNodes);
    return true;
  }

  if (!(node instanceof HTMLElement)) return false;
  if (node.dataset.caretMarker === "true") return false;
  if (node.tagName === "STRONG" || node.tagName === "I") return false;

  for (const child of node.childNodes) {
    changed = transformInlineTextNodes(child) || changed;
  }

  return changed;
}

function absorbTrailingPunctuation(block: HTMLElement) {
  let changed = false;

  for (const child of block.childNodes) {
    if (!(child instanceof HTMLElement)) continue;
    if (child.tagName !== "STRONG" && child.tagName !== "I") continue;

    const next = child.nextSibling;
    if (!(next instanceof Text)) continue;

    const match = next.textContent?.match(/^(\u200B*)([.,!?])(.*)$/s);
    if (!match) continue;

    child.append(match[2]);
    next.textContent = `${match[1]}${match[3]}`;
    if (!next.textContent) next.remove();
    changed = true;
  }

  return changed;
}

function applyInlineTransform(root: HTMLElement) {
  const block = getCurrentBlock(root);
  if (!block || block.tagName === "LI" && block.closest("ul") === null) return;

  const raw = normalizeEditableText(block.textContent ?? "");
  let changed = false;

  if (/\*\*[^*]+\*\*/.test(raw) || /_[^_]+_/.test(raw)) {
    const marker = insertCaretMarker(root);
    changed = transformInlineTextNodes(block);

    if (marker && changed) {
      restoreCaretFromMarker(marker);
    } else {
      marker?.remove();
    }
  }

  if (absorbTrailingPunctuation(block)) {
    placeCaretAtEnd(block);
  }
}

function handleEnter(root: HTMLElement) {
  const block = getCurrentBlock(root);
  if (!block) return false;

  const rawText = normalizeEditableText(block.textContent ?? "");

  if (block.tagName === "P" && rawText.startsWith("## ")) {
    const { after, before } = splitAtCaret(block, 3);
    const heading = document.createElement("h2");
    heading.innerHTML = formatInline(before);
    const paragraph = document.createElement("p");
    paragraph.innerHTML = after ? formatInline(after) : "<br>";
    block.replaceWith(heading);
    heading.after(paragraph);
    if (after) placeCaretAtStart(paragraph);
    else placeCaretAtEnd(paragraph);
    return true;
  }

  if (block.tagName === "P" && rawText.startsWith("# ")) {
    const { after, before } = splitAtCaret(block, 2);
    const heading = document.createElement("h1");
    heading.innerHTML = formatInline(before);
    const paragraph = document.createElement("p");
    paragraph.innerHTML = after ? formatInline(after) : "<br>";
    block.replaceWith(heading);
    heading.after(paragraph);
    if (after) placeCaretAtStart(paragraph);
    else placeCaretAtEnd(paragraph);
    return true;
  }

  if (block.tagName === "P" && /^[-*+]\s/.test(rawText)) {
    const { after, before } = splitAtCaret(block, 2);
    const list = document.createElement("ul");
    const item = document.createElement("li");
    item.innerHTML = formatInline(before);
    list.append(item);
    const paragraph = document.createElement("p");
    paragraph.innerHTML = after ? formatInline(after) : "<br>";
    block.replaceWith(list);
    list.after(paragraph);
    if (after) placeCaretAtStart(paragraph);
    else placeCaretAtEnd(paragraph);
    return true;
  }

  if (block.tagName === "LI") {
    const text = rawText.trim();
    if (text) return false;

    const list = block.parentElement;
    if (!list) return false;

    const paragraph = document.createElement("p");
    paragraph.innerHTML = "<br>";
    list.after(paragraph);
    block.remove();
    if (list.children.length === 0) list.remove();
    placeCaretAtEnd(paragraph);
    return true;
  }

  if (block.tagName === "H1" || block.tagName === "H2") {
    const paragraph = document.createElement("p");
    paragraph.innerHTML = "<br>";
    block.after(paragraph);
    placeCaretAtEnd(paragraph);
    return true;
  }

  return false;
}

export function DungeonEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [spellcheck, setSpellcheck] = useState(true);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.innerHTML = sanitizeHtml(localStorage.getItem(STORAGE_KEY) || DEFAULT_HTML);

    const savedSpellcheck = localStorage.getItem(SPELLCHECK_KEY);
    if (savedSpellcheck !== null) {
      setSpellcheck(savedSpellcheck === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SPELLCHECK_KEY, String(spellcheck));

    const editor = editorRef.current;
    if (!editor) return;

    editor.spellcheck = spellcheck;
    editor.setAttribute("spellcheck", String(spellcheck));
    editor.setAttribute("autocorrect", spellcheck ? "on" : "off");

    if (document.activeElement === editor) {
      editor.blur();
      globalThis.requestAnimationFrame(() => {
        editor.focus();
      });
    }
  }, [spellcheck]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    let observer: MutationObserver | null = null;
    let running = false;

    const normalize = () => {
      if (running) return;
      running = true;
      observer?.disconnect();
      applyInlineTransform(editor);
      save(editor);
      observer?.observe(editor, {
        characterData: true,
        childList: true,
        subtree: true,
      });
      globalThis.setTimeout(() => {
        running = false;
      }, 0);
    };

    observer = new MutationObserver(() => {
      normalize();
    });

    observer.observe(editor, {
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => observer?.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <div className="mx-auto max-w-3xl px-4 py-5 md:px-6 md:py-8 print:max-w-none print:px-0 print:py-0">
        <div
          aria-label="Editor"
          className="min-h-[75vh] w-full border-0 bg-transparent outline-none text-[1.22rem] leading-[1.7] text-stone-900 dark:text-stone-100 print:min-h-0 print:text-black
            [&_h1]:mt-0 [&_h1]:mb-4 [&_h1]:font-serif [&_h1]:text-[2.2rem] [&_h1]:leading-[0.95] [&_h1]:tracking-[0.02em]
            [&_h2]:mt-16 [&_h2]:mb-3 [&_h2]:font-serif [&_h2]:text-[1.5rem] [&_h2]:leading-[1.05] [&_h2]:tracking-[0.04em]
            [&_p]:my-0 [&_p+*]:mt-4 [&_ul]:my-4 [&_ul]:pl-6 [&_li]:my-1.5 [&_strong]:font-semibold [&_i]:italic"
          contentEditable
          onInput={() => {
            const editor = editorRef.current;
            if (!editor) return;
            applyInlineTransform(editor);
            save(editor);
          }}
          onKeyDown={(event) => {
            const editor = editorRef.current;
            if (!editor) return;

            if (event.key === "Enter" && handleEnter(editor)) {
              event.preventDefault();
              save(editor);
            }
          }}
          onKeyUp={() => {
            const editor = editorRef.current;
            if (!editor) return;

            applyInlineTransform(editor);
            save(editor);
          }}
          onPaste={(event) => {
            const editor = editorRef.current;
            if (!editor) return;

            event.preventDefault();
            const html = event.clipboardData.getData("text/html");
            const text = event.clipboardData.getData("text/plain");
            const cleanHtml = html ? sanitizeHtml(html) : escapeHtml(text);

            const selection = globalThis.getSelection();
            if (!selection || selection.rangeCount === 0 || !editor.contains(selection.anchorNode)) return;

            const range = selection.getRangeAt(0);
            range.deleteContents();

            const fragment = document.createElement("template");
            fragment.innerHTML = cleanHtml;
            const content = fragment.content;
            const lastNode = content.lastChild;
            range.insertNode(content);
            if (lastNode) {
              range.setStartAfter(lastNode);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            }

            save(editor);
          }}
          ref={editorRef}
          role="textbox"
          spellCheck={spellcheck}
          style={{ fontFamily: '"Crimson Text", Georgia, serif' }}
          suppressContentEditableWarning
        />

        <div className="mt-4 flex justify-end print:hidden">
          <button
            aria-label={spellcheck ? "Turn spellcheck off" : "Turn spellcheck on"}
            className="flex size-10 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-50"
            onClick={() => setSpellcheck((value) => !value)}
            type="button"
          >
            <span aria-hidden="true" className="text-lg leading-none">{spellcheck ? "✓" : "✗"}</span>
          </button>
        </div>
      </div>
    </main>
  );
}
