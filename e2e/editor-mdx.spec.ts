import { expect, test } from "@playwright/test";


const toggle = (checked: boolean) =>
  `<button class="te-toggle" data-shape="square" aria-checked="${checked}"></button>`;

const TRACK = `<span class="te-track" contenteditable="false">${toggle(true)}${toggle(true)}${toggle(false)}</span>`;

const SAMPLE = [
  "<h1>The Plan</h1>",
  "<h2>Section</h2>",
  "<p>Plain prose with <strong>bold</strong> and <i>italic</i>.</p>",
  "<ul><li>first</li><li>second</li></ul>",
  "<ol><li>one</li><li>two</li></ol>",
  `<ul><li class="te-task">${toggle(true)}done thing</li><li class="te-task">${toggle(false)}todo thing</li></ul>`,
  `<p>progress ${TRACK} here</p>`,
  '<p class="te-arrow">an arrow line</p>',
  '<p class="te-chevron">a chevron line</p>',
].join("");

test("MDX converter round-trips every editor atom as a fixed point", async ({
  page,
}) => {
  await page.goto("/editor");

  const result = await page.evaluate(async (html) => {
    // @ts-expect-error runtime module URL, not a compile-time import
    const { htmlToMdx, mdxToHtml } = await import("/src/editor-mdx.ts");
    const mdx1 = htmlToMdx(html);
    const html2 = mdxToHtml(mdx1);
    const mdx2 = htmlToMdx(html2);
    return { html2, mdx1, mdx2 };
  }, SAMPLE);

  expect(result.mdx1).toContain("# The Plan");
  expect(result.mdx1).toContain("## Section");
  expect(result.mdx1).toContain("**bold**");
  expect(result.mdx1).toContain("_italic_");
  expect(result.mdx1).toContain("- [x] done thing");
  expect(result.mdx1).toContain("- [ ] todo thing");
  expect(result.mdx1).toContain('<Track shape="square" filled="2" total="3" />');
  expect(result.mdx1).toContain('<Line kind="arrow">');
  expect(result.mdx1).toContain('<Line kind="chevron">');

  expect(result.html2).toContain('class="te-task"');
  expect(result.html2).toContain('class="te-track"');
  expect(result.html2).toContain('class="te-arrow"');
  expect(result.html2).toContain('class="te-chevron"');
  expect((result.html2.match(/aria-checked="true"/g) ?? []).length).toBe(3);

  expect(result.mdx2).toBe(result.mdx1);
});

test("hand-authored single-line <Line> and lone <Track> parse to atoms", async ({
  page,
}) => {
  await page.goto("/editor");

  const mdx = [
    "# Title",
    "",
    '<Line kind="arrow">an arrow line</Line>',
    "",
    '<Line kind="chevron">a chevron line</Line>',
    "",
    "- [ ] <Track shape=\"circle\" filled=\"1\" total=\"2\" />",
  ].join("\n");

  const html = await page.evaluate(async (input) => {
    // @ts-expect-error runtime module URL, not a compile-time import
    const { mdxToHtml } = await import("/src/editor-mdx.ts");
    return mdxToHtml(input);
  }, mdx);

  expect(html).toContain('class="te-arrow"');
  expect(html).toContain('class="te-chevron"');
  expect(html).toContain('class="te-task"');
  expect(html).toContain('class="te-track"');
  expect(html).toContain('data-shape="circle"');
});
