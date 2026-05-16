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

export function clampCount(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(Math.trunc(value), 1), MAX_COUNT);
}

export function buildPipElement(shape: Shape, filled: boolean): HTMLSpanElement {
  const pip = document.createElement("span");
  pip.className = "rpg-pip";
  pip.dataset.shape = shape;
  pip.dataset.filled = filled ? "1" : "0";
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

export function TrackPreview({ count, filled = 0, shape }: TrackPreviewProps) {
  return (
    <span className="rpg-track" data-preview="1">
      {Array.from({ length: clampCount(count) }, (_, i) => (
        <span
          className="rpg-pip"
          data-filled={i < filled ? "1" : "0"}
          data-shape={shape}
          key={i}
        />
      ))}
    </span>
  );
}
