import { expect, test } from "@playwright/test";
import fc from "fast-check";


type Inline =
  | { filledRaw: number; kind: "track"; shape: string; total: number }
  | { kind: "em"; t: string }
  | { kind: "strong"; t: string }
  | { kind: "text"; t: string };

type Block =
  | { depth: number; inl: Inline[]; kind: "h" }
  | { inl: Inline[]; kind: "arrow" }
  | { inl: Inline[]; kind: "chevron" }
  | { inl: Inline[]; kind: "p" }
  | { items: Inline[][]; kind: "ol" }
  | { items: Inline[][]; kind: "ul" }
  | { items: { checked: boolean; inl: Inline[] }[]; kind: "task" };

const CHARS = [..."abcXY12 ", ..."#[]<>{}-!.|~"];
const TAME_CHARS = [..."abcXY12 ", ..."#!.|~-"];

const esc = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const stringFrom = (chars: string[]) =>
  fc
    .array(fc.constantFrom(...chars), { maxLength: 10, minLength: 1 })
    .map((cs) => cs.join("").replaceAll(/\s+/g, " ").trim())
    .filter((s) => s.length > 0);

const textArb = stringFrom(CHARS);
const tameTextArb = stringFrom(TAME_CHARS);

const inlineArb: fc.Arbitrary<Inline> = fc.oneof(
  textArb.map((t) => ({ kind: "text" as const, t })),
  tameTextArb.map((t) => ({ kind: "strong" as const, t })),
  tameTextArb.map((t) => ({ kind: "em" as const, t })),
  fc
    .record({
      filledRaw: fc.nat({ max: 12 }),
      shape: fc.constantFrom("square", "circle", "rhomb"),
      total: fc.integer({ max: 12, min: 1 }),
    })
    .map((r) => ({ kind: "track" as const, ...r })),
);

const isNonText = (n: Inline) => n.kind !== "text";

const inlinesArb = fc
  .array(inlineArb, { maxLength: 4, minLength: 1 })
  .map((nodes) => {
    const out: Inline[] = [];
    for (const n of nodes) {
      const prev = out.at(-1);
      if (isNonText(n) && prev && isNonText(prev)) continue;
      out.push(n);
    }
    return out;
  });

const blockArb: fc.Arbitrary<Block> = fc.oneof(
  fc.record({ depth: fc.constantFrom(1, 2), inl: inlinesArb, kind: fc.constant("h") }),
  fc.record({ inl: inlinesArb, kind: fc.constant("p") }),
  fc.record({ inl: inlinesArb, kind: fc.constant("arrow") }),
  fc.record({ inl: inlinesArb, kind: fc.constant("chevron") }),
  fc.record({ items: fc.array(inlinesArb, { maxLength: 3, minLength: 1 }), kind: fc.constant("ul") }),
  fc.record({ items: fc.array(inlinesArb, { maxLength: 3, minLength: 1 }), kind: fc.constant("ol") }),
  fc.record({
    items: fc.array(fc.record({ checked: fc.boolean(), inl: inlinesArb }), {
      maxLength: 3,
      minLength: 1,
    }),
    kind: fc.constant("task"),
  }),
);

const toggle = (checked: boolean, shape = "square") =>
  `<button class="te-toggle" data-shape="${shape}" aria-checked="${checked}"></button>`;

function trackHtml(t: Extract<Inline, { kind: "track" }>): string {
  const filled = Math.min(t.filledRaw, t.total);
  let html = `<span class="te-track" contenteditable="false">`;
  for (let i = 0; i < t.total; i++) html += toggle(i < filled, t.shape);
  return html + "</span>";
}

function inlineHtml(nodes: Inline[]): string {
  return nodes
    .map((n) => {
      if (n.kind === "text") return esc(n.t);
      if (n.kind === "strong") return `<strong>${esc(n.t)}</strong>`;
      if (n.kind === "em") return `<i>${esc(n.t)}</i>`;
      return trackHtml(n);
    })
    .join("");
}

function render(doc: Block[]): string {
  return doc
    .map((b) => {
      switch (b.kind) {
        case "arrow":
          return `<p class="te-arrow">${inlineHtml(b.inl)}</p>`;
        case "chevron":
          return `<p class="te-chevron">${inlineHtml(b.inl)}</p>`;
        case "h":
          return `<h${b.depth}>${inlineHtml(b.inl)}</h${b.depth}>`;
        case "ol":
          return `<ol>${b.items.map((i) => `<li>${inlineHtml(i)}</li>`).join("")}</ol>`;
        case "p":
          return `<p>${inlineHtml(b.inl)}</p>`;
        case "task":
          return `<ul>${b.items.map((t) => `<li class="te-task">${toggle(t.checked)}${inlineHtml(t.inl)}</li>`).join("")}</ul>`;
        case "ul":
          return `<ul>${b.items.map((i) => `<li>${inlineHtml(i)}</li>`).join("")}</ul>`;
      }
    })
    .join("");
}

test("htmlToMdx is a fixed point over arbitrary editor documents", async ({
  page,
}) => {
  await page.goto("/editor");

  await fc.assert(
    fc.asyncProperty(
      fc.array(blockArb, { maxLength: 5, minLength: 1 }),
      async (doc) => {
        const html = render(doc);
        const { mdx1, mdx2 } = await page.evaluate(async (input) => {
          // @ts-expect-error runtime module URL, not a compile-time import
          const { htmlToMdx, mdxToHtml } = await import("/src/editor-mdx.ts");
          const first = htmlToMdx(input);
          return { mdx1: first, mdx2: htmlToMdx(mdxToHtml(first)) };
        }, html);
        expect(mdx2, `unstable for HTML:\n${html}\n\nMDX:\n${mdx1}`).toBe(mdx1);
      },
    ),
    { numRuns: 200 },
  );
});
