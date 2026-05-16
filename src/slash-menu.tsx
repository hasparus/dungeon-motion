import { cn } from "./cn";
import { type SlashCommand, TrackPreview } from "./editor-atoms";

interface SlashMenuProps {
  // Left edge + width track the editor's text column; top sits below the caret.
  anchor: { width: number; left: number; top: number; };
  commands: SlashCommand[];
  count: number | null;
  index: number;
  onPick: (command: SlashCommand) => void;
}

// Autocomplete popup for `/` commands. Keyboard navigation is owned by the
// editor (it intercepts arrows/Enter while the menu is open); this component
// only renders and handles pointer selection. font-text matches the editor's
// reading serif (Crimson Text).
export function SlashMenu({ anchor, commands, count, index, onPick }: SlashMenuProps) {
  if (commands.length === 0) return null;

  const active = Math.min(index, commands.length - 1);

  return (
    <div
      className="fixed z-40 overflow-hidden rounded-lg border border-stone-300 bg-white font-text shadow-xl dark:border-stone-700 dark:bg-stone-900"
      role="listbox"
      style={{ width: anchor.width, left: anchor.left, top: anchor.top + 6 }}
    >
      {commands.map((command, i) => (
        <button
          aria-selected={i === active}
          className={cn(
            "flex w-full items-center gap-3 px-3 py-2 text-left",
            i === active && "bg-stone-100 dark:bg-stone-800",
          )}
          key={command.name}
          // Pointer-down (not click) so the editor keeps its selection.
          onMouseDown={(event) => {
            event.preventDefault();
            onPick(command);
          }}
          role="option"
          type="button"
        >
          <span className="w-28 shrink-0 font-mono text-xs text-stone-400 dark:text-stone-500">
            /{command.name}
          </span>
          <span className="flex-1 text-sm text-stone-700 dark:text-stone-300">
            {command.description}
          </span>
          {command.kind === "track" && command.shape && (
            <TrackPreview
              count={Math.min(count ?? command.defaultCount, 6)}
              shape={command.shape}
            />
          )}
        </button>
      ))}
    </div>
  );
}
