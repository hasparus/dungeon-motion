// RPG primitive atoms shared by the story editor, its slash menu, and the
// help modal. DOM builders produce the live, interactive elements embedded in
// the contentEditable surface; TrackPreview renders the same look as inert
// React for menus and documentation. Styling lives in editor-atoms.css.

export type Shape = "box" | "circle" | "diamond";

export interface SlashCommand {
  blockClass?: string;
  defaultCount: number;
  description: string;
  kind: "block" | "track";
  name: string;
  shape?: Shape;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    defaultCount: 3,
    description: "Row of checkboxes",
    kind: "track",
    name: "check",
    shape: "box",
  },
  {
    defaultCount: 4,
    description: "Progress / countdown clock",
    kind: "track",
    name: "progress",
    shape: "circle",
  },
  {
    defaultCount: 5,
    description: "Load / supply track",
    kind: "track",
    name: "load",
    shape: "diamond",
  },
  {
    blockClass: "rpg-monster-move",
    defaultCount: 0,
    description: "Monster move line",
    kind: "block",
    name: "monster-move",
  },
  {
    blockClass: "rpg-question",
    defaultCount: 0,
    description: "GM question prompt",
    kind: "block",
    name: "question",
  },
];

const MAX_COUNT = 12;

// Each pip is a binary toggle, so it carries role="checkbox" + aria-checked.
// The label gives it an accessible name (a bare checkbox role has none) and
// distinguishes the three track kinds for assistive tech and tests alike.
export const PIP_LABEL: Record<Shape, string> = {
  box: "checkbox",
  circle: "progress segment",
  diamond: "load segment",
};

export function clampCount(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(Math.trunc(value), 1), MAX_COUNT);
}

export function buildPipElement(shape: Shape, filled: boolean): HTMLSpanElement {
  const pip = document.createElement("span");
  pip.className = "rpg-pip";
  pip.dataset.shape = shape;
  pip.setAttribute("role", "checkbox");
  pip.setAttribute("aria-label", PIP_LABEL[shape]);
  pip.setAttribute("aria-checked", filled ? "true" : "false");
  pip.setAttribute("contenteditable", "false");
  return pip;
}

export function buildTrackElement(shape: Shape, count: number): HTMLSpanElement {
  const track = document.createElement("span");
  track.className = "rpg-track";
  track.setAttribute("contenteditable", "false");
  for (let i = 0; i < clampCount(count); i++) {
    track.append(buildPipElement(shape, false));
  }
  return track;
}

interface TrackPreviewProps {
  count: number;
  filled?: number;
  shape: Shape;
}

// Inert illustration for menus and docs — aria-hidden so screen readers get
// the surrounding prose instead of a redundant run of checkbox announcements.
export function TrackPreview({ count, filled = 0, shape }: TrackPreviewProps) {
  return (
    <span aria-hidden="true" className="rpg-track" data-preview="1">
      {Array.from({ length: clampCount(count) }, (_, i) => (
        <span
          aria-checked={i < filled ? "true" : "false"}
          className="rpg-pip"
          data-shape={shape}
          key={i}
          role="checkbox"
        />
      ))}
    </span>
  );
}
