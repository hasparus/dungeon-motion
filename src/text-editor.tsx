import { useEffect, useRef, useState } from "react";

import {
  buildToggleElement,
  buildTrackElement,
  populateToggleElement,
  type Shape,
  SLASH_COMMANDS,
  type SlashCommand,
} from "./editor-atoms";
import { EditorHelpModal } from "./editor-help-modal";
import { SlashMenu } from "./slash-menu";
import styles from "./text-editor.module.css";
import "./editor-atoms.css";

const STORAGE_KEY = "text-editor-document";
const STORAGE_LEGACY_KEYS: string[] = [];
const SPELLCHECK_KEY = "text-editor-spellcheck";

function migrateStorage() {
  if (localStorage.getItem(STORAGE_KEY)) return;
  for (const key of STORAGE_LEGACY_KEYS) {
    const data = localStorage.getItem(key);
    if (data) {
      localStorage.setItem(STORAGE_KEY, data);
      localStorage.removeItem(key);
      return;
    }
  }
}

const DEFAULT_HTML = [
  "<h1>The Plan of the Parliament of Erl</h1>",
  "<p>In their ruddy jackets of leather that reached to their knees the men of Erl appeared before their lord, the stately white-haired man in his long red room. He leaned in his carven chair and heard their spokesman.</p>",
  '<p>"For seven hundred years the chiefs of your race have ruled us well; and their deeds are remembered by the minor minstrels, living on yet in their little tinkling songs. And yet the generations stream away, and there is no new thing."</p>',
  '<p>"What would you?" said the lord.</p>',
  '<p>"We would be ruled by a magic lord," they said.</p>',
  "<p><i>— Lord Dunsany, The King of Elfland's Daughter (1924)</i></p>",
].join("");

function escapeHtml(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function plainTextToHtml(text: string) {
  return escapeHtml(text.replaceAll(/\r\n?/g, "\n")).replaceAll("\n", "<br>");
}

const ALLOWED_TAGS = new Set([
  "BR",
  "H1",
  "H2",
  "I",
  "LI",
  "OL",
  "P",
  "STRONG",
  "UL",
]);
const BLOCK_TAGS = new Set(["H1", "H2", "OL", "P", "UL"]);
// Dropped entirely — subtree is discarded. Includes foreign-namespace
// containers (SVG, MATH) whose descendants have lowercase tagNames and
// can smuggle executable-looking elements past an uppercase-only check.
const DROPPED_TAGS = new Set([
  "IFRAME",
  "MATH",
  "OBJECT",
  "SCRIPT",
  "STYLE",
  "SVG",
]);
const TAG_RENAME: Record<string, string> = { B: "STRONG", EM: "I" };

// Editor atoms (see editor-atoms.tsx) are embedded as elements carrying a
// known class. The sanitizer must preserve them across the localStorage
// round-trip — but strictly: only the class plus a small set of validated
// attributes survive, everything else is still dropped. The class must be
// *exactly* the atom name (a second class flips it back to the flatten path).
const ATOM_TAGS: Record<string, string> = {
  "te-arrow": "P",
  "te-chevron": "P",
  "te-task": "LI",
  "te-toggle": "BUTTON",
  "te-track": "SPAN",
};
const SHAPES = new Set(["circle", "rhomb", "square"]);

function sanitizeInto(source: ParentNode, target: ParentNode) {
  for (const child of source.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      target.append(child.cloneNode(false));
      continue;
    }
    if (!(child instanceof Element)) continue;

    // Normalise: SVG/MathML elements keep case-preserved tagNames
    // (lowercase), HTML elements are uppercase. Compare in one case.
    const rawTag = child.tagName.toUpperCase();
    const tag = TAG_RENAME[rawTag] ?? rawTag;

    if (DROPPED_TAGS.has(tag)) continue;

    // Editor atom: keep the element with its class and validated attrs only.
    const atomClass = child.getAttribute("class");
    if (
      atomClass &&
      ATOM_TAGS[atomClass] === tag &&
      child instanceof HTMLElement
    ) {
      const el = document.createElement(tag.toLowerCase());
      el.className = atomClass;
      if (atomClass === "te-track") {
        el.setAttribute("contenteditable", "false");
      }
      if (atomClass === "te-toggle") {
        const rawShape = child.dataset.shape ?? "";
        const shape = (SHAPES.has(rawShape) ? rawShape : "square") as Shape;
        populateToggleElement(
          el,
          shape,
          child.getAttribute("aria-checked") === "true",
        );
      }
      target.append(el);
      sanitizeInto(child, el);
      continue;
    }

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

// Deliberately lossy. `**foo * bar**` won't match (lone `*` inside kills it)
// and `foo_bar_baz` will italicize mid-word. Full Commonmark is out of scope.
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
  if (!root.contains(selection.anchorNode)) return null;

  let node: Node | null = selection.anchorNode;
  while (node && node !== root) {
    if (
      node instanceof HTMLElement &&
      ["H1", "H2", "LI", "P"].includes(node.tagName)
    ) {
      return node;
    }
    node = node.parentNode;
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

function findPrefixTextNode(block: HTMLElement, prefix: string): Text | null {
  // Only walk top-level text nodes — do not descend into inline children
  // so a pasted <strong>- text</strong> isn't mis-identified as the prefix.
  for (const child of block.childNodes) {
    if (child instanceof Text && child.data.startsWith(prefix)) return child;
  }
  return null;
}

function extractBeforeCaret(
  block: HTMLElement,
  prefix: string,
): DocumentFragment {
  const prefixNode = findPrefixTextNode(block, prefix);
  const selection = globalThis.getSelection();

  const range = document.createRange();
  if (prefixNode) range.setStart(prefixNode, prefix.length);
  else range.setStart(block, 0);

  if (
    selection &&
    selection.rangeCount > 0 &&
    block.contains(selection.anchorNode)
  ) {
    const caret = selection.getRangeAt(0);
    range.setEnd(caret.endContainer, caret.endOffset);
  } else {
    range.setEndAfter(block.lastChild ?? block);
  }

  const fragment = range.extractContents();

  // Prefix chars remain in the block's text node (range started past them);
  // strip them now so the block only holds post-caret content.
  if (prefixNode) {
    prefixNode.data = prefixNode.data.slice(prefix.length);
    if (!prefixNode.data) prefixNode.remove();
  }

  return fragment;
}

function extractAfterCaret(block: HTMLElement): DocumentFragment {
  // An empty block has nothing after the caret — and setEndAfter(block) would
  // reach past the block boundary, so bail with an empty fragment.
  if (!block.lastChild) return document.createDocumentFragment();

  const selection = globalThis.getSelection();
  const range = document.createRange();

  if (
    selection &&
    selection.rangeCount > 0 &&
    block.contains(selection.anchorNode)
  ) {
    const caret = selection.getRangeAt(0);
    range.setStart(caret.endContainer, caret.endOffset);
  } else {
    range.setStart(block, block.childNodes.length);
  }
  range.setEndAfter(block.lastChild);

  return range.extractContents();
}

// Places the caret immediately after a block's first child — used for atoms
// whose first child is a contenteditable=false toggle the caret must clear.
function setCaretAfterFirstChild(element: HTMLElement) {
  const selection = globalThis.getSelection();
  if (!selection) return;

  const range = document.createRange();
  range.setStart(element, Math.min(1, element.childNodes.length));
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function moveChildrenInto(source: ParentNode, target: ParentNode) {
  while (source.firstChild) target.append(source.firstChild);
}

// Roving tabindex: each track keeps exactly one toggle in the Tab order, so
// Tab enters/leaves the group and ArrowLeft/Right move within it.
function normalizeTrackTabindexes(root: HTMLElement) {
  for (const track of root.querySelectorAll(".te-track")) {
    const toggles = track.querySelectorAll<HTMLElement>(".te-toggle");
    for (const [index, toggle] of toggles.entries()) {
      toggle.tabIndex = index === 0 ? 0 : -1;
    }
  }
}

interface UndoSnapshot {
  html: string;
  selection: { offset: number; path: number[] } | null;
}

// Records the caret as a child-index path from `root` — survives an
// innerHTML restore because the restored DOM is byte-identical.
function captureSelection(root: HTMLElement): UndoSnapshot["selection"] {
  const selection = globalThis.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!root.contains(range.startContainer)) return null;

  const path: number[] = [];
  let node: Node = range.startContainer;
  while (node !== root) {
    const parent: ParentNode | null = node.parentNode;
    if (!parent) return null;
    path.unshift([...parent.childNodes].indexOf(node as ChildNode));
    node = parent;
  }
  return { offset: range.startOffset, path };
}

function restoreSelection(
  root: HTMLElement,
  snapshot: UndoSnapshot["selection"],
) {
  if (!snapshot) return;

  let node: Node = root;
  for (const index of snapshot.path) {
    const child: ChildNode | undefined = node.childNodes[index];
    if (!child) return;
    node = child;
  }

  const limit =
    node.nodeType === Node.TEXT_NODE
      ? (node.textContent ?? "").length
      : node.childNodes.length;
  const selection = globalThis.getSelection();
  if (!selection) return;

  const range = document.createRange();
  range.setStart(node, Math.min(snapshot.offset, limit));
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function captureSnapshot(root: HTMLElement): UndoSnapshot {
  return { html: root.innerHTML, selection: captureSelection(root) };
}

function saveImmediate(root: HTMLElement) {
  localStorage.setItem(STORAGE_KEY, root.innerHTML.replaceAll("\u200B", ""));
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function save(root: HTMLElement) {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveImmediate(root);
    saveTimer = null;
  }, 200);
}

function flushSave(root: HTMLElement) {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  saveImmediate(root);
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

    if (wrapper.textContent === raw && wrapper.children.length === 0)
      return false;

    node.replaceWith(...wrapper.childNodes);
    return true;
  }

  if (!(node instanceof HTMLElement)) return false;
  if (node.dataset.caretMarker === "true") return false;
  if (node.tagName === "STRONG" || node.tagName === "I") return false;

  // Snapshot: recursion may replaceWith() on children and mutate the live list.
  // eslint-disable-next-line unicorn/no-useless-spread
  for (const child of [...node.childNodes]) {
    changed = transformInlineTextNodes(child) || changed;
  }

  return changed;
}

function absorbTrailingPunctuation(block: HTMLElement) {
  let changed = false;

  // Snapshot: body mutates siblings (appends to child, rewrites next text node).
  // eslint-disable-next-line unicorn/no-useless-spread
  for (const child of [...block.childNodes]) {
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

function normalizeEmptyBlocks(root: HTMLElement) {
  for (const tag of ["p", "h1", "h2", "li"]) {
    for (const el of root.querySelectorAll(tag)) {
      if (el.childNodes.length === 0) {
        el.append(document.createElement("br"));
      }
    }
  }
}

function applyInlineTransform(root: HTMLElement) {
  const block = getCurrentBlock(root);
  if (!block || (block.tagName === "LI" && block.closest("ul, ol") === null))
    return;

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

// `- [ ] ` / `- [x] ` shorthand. Fires on input the moment the trailing space
// completes the marker, so the checkbox appears immediately rather than on
// Enter like the other block transforms. Returns the pre-transform snapshot
// when it fired (for custom undo), or null when nothing changed.
function applyTaskShorthand(root: HTMLElement): UndoSnapshot | null {
  const block = getCurrentBlock(root);
  if (!block) return null;

  const text = normalizeEditableText(block.textContent ?? "");

  if (block.tagName === "P") {
    const match = text.match(/^[-*+] \[([ xX])\] $/);
    if (!match) return null;

    const snapshot = captureSnapshot(root);
    const item = document.createElement("li");
    item.className = "te-task";
    item.append(buildToggleElement("square", match[1].toLowerCase() === "x"));
    const list = document.createElement("ul");
    list.append(item);
    block.replaceWith(list);
    setCaretAfterFirstChild(item);
    return snapshot;
  }

  if (block.tagName === "LI" && !block.classList.contains("te-task")) {
    const match = text.match(/^\[([ xX])\] /);
    if (!match) return null;

    const prefixNode = findPrefixTextNode(block, match[0]);
    if (!prefixNode) return null;

    const snapshot = captureSnapshot(root);
    prefixNode.data = prefixNode.data.slice(match[0].length);
    if (!prefixNode.data) prefixNode.remove();
    block.classList.add("te-task");
    block.prepend(buildToggleElement("square", match[1].toLowerCase() === "x"));
    return snapshot;
  }

  return null;
}

interface SlashState {
  // Placement: left edge + width follow the editor's text column so the menu
  // lines up with the paragraph; top follows the caret's line.
  anchor: { width: number; left: number; top: number };
  atStart: boolean;
  blockTag: string;
  count: number | null;
  query: string;
}

// The query reaches from the `/` to the caret: a command name, then an
// optional count. SLASH_QUERY_BOUNDED additionally anchors the `/` to a word
// boundary so prose like `and/or` and dates never open the menu.
const SLASH_QUERY = /\/([a-z-]*)(?: +(\d+))? *$/;
const SLASH_QUERY_BOUNDED = /(^|\s)\/([a-z-]*)(?: +(\d+))? *$/;
const SLASH_MENU_ID = "te-slash-menu";
const slashOptionId = (name: string) => `te-slash-option-${name}`;

// The .te-track immediately before a collapsed caret, if any — lets
// Backspace peel one toggle off a track instead of deleting the whole atom.
function trackBeforeCaret(root: HTMLElement): HTMLElement | null {
  const selection = globalThis.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!range.collapsed || !root.contains(range.startContainer)) return null;

  let before: Node | null;
  if (range.startContainer instanceof Text) {
    if (range.startOffset !== 0) return null;
    before = range.startContainer.previousSibling;
  } else {
    before = range.startContainer.childNodes[range.startOffset - 1] ?? null;
  }

  return before instanceof HTMLElement && before.classList.contains("te-track")
    ? before
    : null;
}

function readSlashState(root: HTMLElement): SlashState | null {
  const selection = globalThis.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!range.collapsed || !(range.startContainer instanceof Text)) return null;
  if (!root.contains(range.startContainer)) return null;

  const localMatch = range.startContainer.data
    .slice(0, range.startOffset)
    .match(SLASH_QUERY);
  if (!localMatch) return null;

  const block = getCurrentBlock(root);
  if (!block) return null;

  const blockRange = document.createRange();
  blockRange.selectNodeContents(block);
  blockRange.setEnd(range.startContainer, range.startOffset);
  const blockMatch = blockRange.toString().match(SLASH_QUERY_BOUNDED);
  if (!blockMatch) return null;

  const caretRect = range.getBoundingClientRect();
  const editorRect = root.getBoundingClientRect();

  return {
    anchor: {
      width: editorRect.width,
      left: editorRect.left,
      top: caretRect.bottom,
    },
    atStart: blockMatch[1] === "",
    blockTag: block.tagName,
    count: localMatch[2] ? Number.parseInt(localMatch[2], 10) : null,
    query: localMatch[1],
  };
}

// Track commands apply anywhere; block commands only at the start of a plain
// paragraph (commitSlash adds the class to a <p>, so nothing else qualifies).
function matchSlashCommands(state: SlashState): SlashCommand[] {
  return SLASH_COMMANDS.filter(
    (command) =>
      command.name.startsWith(state.query) &&
      (command.kind === "track" || (state.atStart && state.blockTag === "P")),
  );
}

function handleEnter(root: HTMLElement) {
  const block = getCurrentBlock(root);
  if (!block) return false;

  const rawText = normalizeEditableText(block.textContent ?? "");

  if (
    block.tagName === "P" &&
    (rawText.startsWith("## ") || rawText.startsWith("# "))
  ) {
    const prefix = rawText.startsWith("## ") ? "## " : "# ";
    const tag = prefix === "## " ? "h2" : "h1";
    const heading = document.createElement(tag);
    heading.append(extractBeforeCaret(block, prefix));

    const paragraph = document.createElement("p");
    const hasAfter = block.hasChildNodes();
    if (hasAfter) moveChildrenInto(block, paragraph);
    else paragraph.innerHTML = "<br>";

    block.replaceWith(heading);
    heading.after(paragraph);
    if (hasAfter) placeCaretAtStart(paragraph);
    else placeCaretAtEnd(paragraph);
    return true;
  }

  // `- ` / `* ` / `+ ` start an unordered list; `1. ` an ordered one. The
  // caret lands in a fresh trailing item so the list keeps going on Enter;
  // an Enter on that still-empty item exits the list (see the LI branch).
  const bulletMatch = rawText.match(/^[-*+] /);
  const listMatch = bulletMatch ?? rawText.match(/^\d+\. /);
  if (block.tagName === "P" && listMatch) {
    const firstItem = document.createElement("li");
    firstItem.append(extractBeforeCaret(block, listMatch[0]));

    const nextItem = document.createElement("li");
    const hasAfter = block.hasChildNodes();
    if (hasAfter) moveChildrenInto(block, nextItem);
    else nextItem.innerHTML = "<br>";

    const list = document.createElement(bulletMatch ? "ul" : "ol");
    list.append(firstItem, nextItem);
    block.replaceWith(list);

    if (hasAfter) placeCaretAtStart(nextItem);
    else placeCaretAtEnd(nextItem);
    return true;
  }

  if (
    block.tagName === "P" &&
    (block.classList.contains("te-arrow") ||
      block.classList.contains("te-chevron"))
  ) {
    const className = block.classList.contains("te-arrow")
      ? "te-arrow"
      : "te-chevron";

    // Enter on an empty styled line exits it back to a plain paragraph.
    if (!rawText.trim()) {
      block.classList.remove(className);
      placeCaretAtEnd(block);
      return true;
    }

    // Otherwise split into another line of the same kind.
    const paragraph = document.createElement("p");
    paragraph.className = className;
    const tail = extractAfterCaret(block);
    if (tail.childNodes.length > 0) paragraph.append(tail);
    else paragraph.innerHTML = "<br>";
    block.after(paragraph);
    placeCaretAtStart(paragraph);
    return true;
  }

  if (block.tagName === "LI") {
    const text = rawText.trim();

    // Continue a task list: a fresh item carries its own checkbox.
    if (text && block.classList.contains("te-task")) {
      const item = document.createElement("li");
      item.className = "te-task";
      item.append(buildToggleElement("square", false));
      const tail = extractAfterCaret(block);
      if (tail.childNodes.length > 0) item.append(tail);
      block.after(item);
      setCaretAfterFirstChild(item);
      return true;
    }

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

export function TextEditor() {
  const editorRef = useRef<HTMLDivElement>(null);
  // One-slot custom undo: the editor's transforms (slash commands, `- [ ] `,
  // headings, lists) bypass the browser's history, so Ctrl/Cmd+Z restores
  // this pre-transform snapshot. Cleared once the writer types past it.
  const pendingUndo = useRef<UndoSnapshot | null>(null);
  const [spellcheck, setSpellcheck] = useState(() => {
    const saved = localStorage.getItem(SPELLCHECK_KEY);
    return saved === null ? true : saved === "true";
  });
  const [slash, setSlash] = useState<SlashState | null>(null);
  const [slashIndex, setSlashIndex] = useState(0);

  // Recomputes the pending `/command` query after any caret-moving event.
  function refreshSlash() {
    const editor = editorRef.current;
    if (!editor) return;
    const next = readSlashState(editor);
    setSlash(next && matchSlashCommands(next).length > 0 ? next : null);
    setSlashIndex(0);
  }

  function undoTransform(editor: HTMLElement) {
    const snapshot = pendingUndo.current;
    if (!snapshot) return;
    editor.innerHTML = snapshot.html;
    normalizeTrackTabindexes(editor);
    restoreSelection(editor, snapshot.selection);
    pendingUndo.current = null;
    setSlash(null);
    flushSave(editor);
  }

  // Replaces the typed `/command` query with its rendered atom.
  function commitSlash(command: SlashCommand, count: number | null) {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = globalThis.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setSlash(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const node = range.startContainer;
    if (!(node instanceof Text)) {
      setSlash(null);
      return;
    }

    const localMatch = node.data.slice(0, range.startOffset).match(SLASH_QUERY);
    if (!localMatch) {
      setSlash(null);
      return;
    }

    const snapshot = captureSnapshot(editor);

    const deleteRange = document.createRange();
    deleteRange.setStart(node, range.startOffset - localMatch[0].length);
    deleteRange.setEnd(node, range.startOffset);
    deleteRange.deleteContents();

    if (command.kind === "track" && command.shape) {
      // deleteRange is collapsed at the deletion point; insert the atom and a
      // trailing space there as one fragment, then drop the caret past both.
      const track = buildTrackElement(
        command.shape,
        count ?? command.defaultCount,
      );
      // Non-breaking space: a plain trailing space next to an inline atom gets
      // collapsed away by contentEditable whitespace normalisation.
      const space = document.createTextNode("\u00A0");
      const fragment = document.createDocumentFragment();
      fragment.append(track, space);
      deleteRange.insertNode(fragment);

      const caret = document.createRange();
      caret.setStartAfter(space);
      caret.collapse(true);
      selection.removeAllRanges();
      selection.addRange(caret);
    } else if (command.blockClass) {
      const block = getCurrentBlock(editor);
      if (block && block.tagName === "P") {
        // Replace the line kind rather than stacking marker classes.
        block.classList.remove("te-arrow", "te-chevron");
        block.classList.add(command.blockClass);
      }
    }

    pendingUndo.current = snapshot;
    setSlash(null);
    setSlashIndex(0);
    normalizeEmptyBlocks(editor);
    flushSave(editor);
  }

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    migrateStorage();
    editor.innerHTML = sanitizeHtml(
      localStorage.getItem(STORAGE_KEY) || DEFAULT_HTML,
    );
    normalizeTrackTabindexes(editor);

    const handleBeforeUnload = () => flushSave(editor);
    globalThis.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      globalThis.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // A caret move that fires no `input` event (arrow keys, clicks) still has to
  // refresh the slash menu, otherwise it lingers stale at the old anchor.
  useEffect(() => {
    let scheduled = 0;
    const handler = () => {
      if (scheduled) return;
      scheduled = requestAnimationFrame(() => {
        scheduled = 0;
        const editor = editorRef.current;
        const anchor = globalThis.getSelection()?.anchorNode ?? null;
        if (editor && anchor && editor.contains(anchor)) refreshSlash();
      });
    };
    document.addEventListener("selectionchange", handler);
    return () => {
      document.removeEventListener("selectionchange", handler);
      if (scheduled) cancelAnimationFrame(scheduled);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(SPELLCHECK_KEY, String(spellcheck));
  }, [spellcheck]);

  const slashCommands = slash ? matchSlashCommands(slash) : [];
  const slashActiveId =
    slashCommands.length > 0
      ? slashOptionId(
          slashCommands[Math.min(slashIndex, slashCommands.length - 1)].name,
        )
      : undefined;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-24 md:px-6 print:max-w-none print:px-0 print:py-0">
        <div
          aria-activedescendant={slash ? slashActiveId : undefined}
          aria-controls={slash ? SLASH_MENU_ID : undefined}
          aria-label="Editor"
          autoCapitalize={spellcheck ? "sentences" : "off"}
          autoCorrect={spellcheck ? "on" : "off"}
          className={`${styles.editor} min-h-[75vh] w-full border-0 bg-transparent outline-none text-[1.22rem] leading-[1.7] print:min-h-0 print:text-black`}
          contentEditable
          onBlur={() => {
            const editor = editorRef.current;
            if (editor) flushSave(editor);
            setSlash(null);
          }}
          onClick={(event) => {
            const editor = editorRef.current;
            if (!editor) return;

            // Click — or keyboard Space/Enter on a focused toggle — toggles it.
            const toggle = (event.target as HTMLElement).closest?.(
              ".te-toggle",
            );
            if (toggle instanceof HTMLElement && editor.contains(toggle)) {
              const checked = toggle.getAttribute("aria-checked") === "true";
              toggle.setAttribute("aria-checked", checked ? "false" : "true");
              flushSave(editor);
            }
            refreshSlash();
          }}
          onFocus={(event) => {
            // Keep the track's roving tabindex on whichever toggle was reached.
            const toggle = (event.target as HTMLElement).closest?.(
              ".te-toggle",
            );
            if (!(toggle instanceof HTMLElement)) return;
            const track = toggle.closest(".te-track");
            if (!track) return;
            for (const sibling of track.querySelectorAll<HTMLElement>(
              ".te-toggle",
            )) {
              sibling.tabIndex = sibling === toggle ? 0 : -1;
            }
          }}
          onInput={(event) => {
            const editor = editorRef.current;
            if (!editor) return;
            if ((event.nativeEvent as InputEvent).isComposing) return;
            applyInlineTransform(editor);
            // A task transform stores its undo snapshot; plain typing (null)
            // clears any pending one — the writer has moved past it.
            pendingUndo.current = applyTaskShorthand(editor);
            normalizeEmptyBlocks(editor);
            refreshSlash();
            save(editor);
          }}
          onKeyDown={(event) => {
            const editor = editorRef.current;
            if (!editor) return;

            // Ctrl/Cmd+Z reverts the most recent editor transform.
            if (
              (event.metaKey || event.ctrlKey) &&
              !event.shiftKey &&
              event.key.toLowerCase() === "z" &&
              pendingUndo.current
            ) {
              event.preventDefault();
              undoTransform(editor);
              return;
            }

            // Keys on a focused toggle: arrows rove within the track, the rest
            // (Space, Enter, Tab) are left to the native button.
            const onToggle = (event.target as HTMLElement).closest?.(
              ".te-toggle",
            );
            if (onToggle) {
              if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                event.preventDefault();
                const track = onToggle.closest(".te-track");
                if (track) {
                  const toggles = [
                    ...track.querySelectorAll<HTMLButtonElement>(".te-toggle"),
                  ];
                  const i = toggles.indexOf(onToggle as HTMLButtonElement);
                  const step = event.key === "ArrowRight" ? 1 : -1;
                  toggles[
                    (i + step + toggles.length) % toggles.length
                  ]?.focus();
                }
              }
              return;
            }

            if (slash) {
              const matches = matchSlashCommands(slash);
              if (matches.length > 0) {
                const selected =
                  matches[Math.min(slashIndex, matches.length - 1)];

                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setSlashIndex((index) => (index + 1) % matches.length);
                  return;
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setSlashIndex(
                    (index) => (index - 1 + matches.length) % matches.length,
                  );
                  return;
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  setSlash(null);
                  return;
                }
                // Tab dismisses the menu and is left to move focus normally.
                if (event.key === "Tab") {
                  setSlash(null);
                  return;
                }
                // A track command needs its count before it can be committed;
                // until then, let Space through so the number can be typed.
                const ready = selected.kind === "block" || slash.count !== null;
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitSlash(selected, slash.count);
                  return;
                }
                if (event.key === " " && ready) {
                  event.preventDefault();
                  commitSlash(selected, slash.count);
                  return;
                }
              }
            }

            // Backspace just before a track peels off its last toggle rather
            // than deleting the whole atom. The final toggle falls through to
            // the default (which removes the now-empty track).
            if (event.key === "Backspace") {
              const track = trackBeforeCaret(editor);
              const toggles = track
                ? [...track.querySelectorAll(".te-toggle")]
                : [];
              const last = toggles.at(-1);
              if (last && toggles.length > 1) {
                event.preventDefault();
                last.remove();
                flushSave(editor);
                return;
              }
            }

            if (event.key === "Enter") {
              const snapshot = captureSnapshot(editor);
              if (handleEnter(editor)) {
                event.preventDefault();
                normalizeEmptyBlocks(editor);
                pendingUndo.current = snapshot;
                flushSave(editor);
              }
            }
          }}
          // Mouse-down on a toggle would normally pull focus onto the button
          // and wipe the caret. Stop the default so clicks toggle without
          // uprooting the writer; keyboard focus still works (no mousedown).
          onMouseDown={(event) => {
            const toggle = (event.target as HTMLElement).closest?.(
              ".te-toggle",
            );
            if (toggle) event.preventDefault();
          }}
          onPaste={(event) => {
            const editor = editorRef.current;
            if (!editor) return;

            event.preventDefault();
            pendingUndo.current = null;
            const html = event.clipboardData.getData("text/html");
            const text = event.clipboardData.getData("text/plain");
            const cleanHtml = html ? sanitizeHtml(html) : plainTextToHtml(text);

            const selection = globalThis.getSelection();
            if (
              !selection ||
              selection.rangeCount === 0 ||
              !editor.contains(selection.anchorNode)
            )
              return;

            const range = selection.getRangeAt(0);
            range.deleteContents();

            const template = document.createElement("template");
            template.innerHTML = cleanHtml;
            const content = template.content;
            const hasBlockChild = [...content.childNodes].some(
              (n) => n instanceof Element && BLOCK_TAGS.has(n.tagName),
            );

            if (!hasBlockChild) {
              const lastNode = content.lastChild;
              range.insertNode(content);
              if (lastNode) {
                range.setStartAfter(lastNode);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
              }
              normalizeEmptyBlocks(editor);
              flushSave(editor);
              return;
            }

            // Block-level paste: split the current block at the caret and
            // thread the pasted blocks between the halves to avoid invalid
            // nesting (e.g. <p>...<h1>...</h1>...</p>). When the caret is
            // inside a list item, splitting would produce <ul><li>..</li>
            // <h1>..</h1>..</ul> — invalid. In that case, insert after the
            // enclosing list and leave the item intact.
            const currentBlock = getCurrentBlock(editor);
            if (!currentBlock) {
              editor.append(content);
              normalizeEmptyBlocks(editor);
              flushSave(editor);
              return;
            }

            const list = currentBlock.closest("ul, ol");
            const insertAfter =
              currentBlock.tagName === "LI" && list ? list : currentBlock;
            const shouldSplitTail = insertAfter === currentBlock;

            let tail: DocumentFragment | null = null;
            if (shouldSplitTail) {
              const tailRange = document.createRange();
              tailRange.setStart(range.endContainer, range.endOffset);
              tailRange.setEndAfter(currentBlock.lastChild ?? currentBlock);
              tail = tailRange.extractContents();
            }

            let previous: ChildNode = insertAfter;
            // Snapshot: previous.after(node) moves node out of content,
            // mutating the live childNodes list.
            // eslint-disable-next-line unicorn/no-useless-spread
            for (const node of [...content.childNodes]) {
              if (node instanceof Element && BLOCK_TAGS.has(node.tagName)) {
                previous.after(node);
                previous = node;
              } else {
                // Top-level inline/text among blocks: wrap in a paragraph.
                const wrapper = document.createElement("p");
                wrapper.append(node);
                previous.after(wrapper);
                previous = wrapper;
              }
            }

            if (tail && tail.childNodes.length > 0) {
              const tailBlock = document.createElement("p");
              tailBlock.append(tail);
              previous.after(tailBlock);
            }

            if (previous instanceof HTMLElement) placeCaretAtEnd(previous);
            normalizeEmptyBlocks(editor);
            flushSave(editor);
          }}
          ref={editorRef}
          role="textbox"
          spellCheck={spellcheck}
          suppressContentEditableWarning
        />

        <div className="mt-4 flex justify-end print:hidden">
          <button
            aria-label={
              spellcheck ? "Turn spellcheck off" : "Turn spellcheck on"
            }
            className="flex font-mono text-xs items-center justify-center px-1 py-0.5 text-stone-500 transition hover:duration-0 hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-50"
            onClick={() => setSpellcheck((value) => !value)}
            type="button"
          >
            [spellcheck {spellcheck ? "on" : "off"}]
          </button>
        </div>
      </div>

      <EditorHelpModal />

      {slash && (
        <SlashMenu
          activeId={slashActiveId}
          anchor={slash.anchor}
          commands={slashCommands}
          count={slash.count}
          id={SLASH_MENU_ID}
          index={slashIndex}
          onPick={(command) => commitSlash(command, slash.count)}
          optionId={slashOptionId}
        />
      )}
    </main>
  );
}
