import { cn } from "./cn";
import { type SlashCommand, TrackPreview } from "./editor-atoms";

interface SlashMenuProps {
  commands: SlashCommand[];
  count: number | null;
  index: number;
  onPick: (command: SlashCommand) => void;
  rect: DOMRect;
}

// Autocomplete popup for `/` commands. Keyboard navigation is owned by the
// editor (it intercepts arrows/Enter while the menu is open); this component
// only renders and handles pointer selection.
export function SlashMenu({ commands, count, index, onPick, rect }: SlashMenuProps) {
  if (commands.length === 0) return null;

  const active = Math.min(index, commands.length - 1);

  return (
    <div
      className="fixed z-40 w-72 overflow-hidden rounded-lg border border-stone-300 bg-white py-1 shadow-xl dark:border-stone-700 dark:bg-stone-900"
      role="listbox"
      style={{ left: rect.left, top: rect.bottom + 6 }}
    >
      {commands.map((command, i) => (
        <button
          aria-selected={i === active}
          className={cn(
            "flex w-full items-center gap-2 px-3 py-1.5 text-left",
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
          <span className="font-mono text-xs text-stone-400 dark:text-stone-500">
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
