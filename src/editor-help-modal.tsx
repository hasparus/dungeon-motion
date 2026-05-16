import { type ReactNode, useEffect, useRef } from "react";

import { SLASH_COMMANDS, TrackPreview } from "./editor-atoms";

interface EditorHelpModalProps {
  onClose: () => void;
  open: boolean;
}

function Row({ children, code }: { children: ReactNode; code: string }) {
  return (
    <div className="flex items-baseline gap-3 py-1">
      <code className="shrink-0 rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-300">
        {code}
      </code>
      <span className="flex-1 text-sm text-stone-700 dark:text-stone-300">{children}</span>
    </div>
  );
}

function Section({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="mt-5">
      <h3 className="m-0 font-serif text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400">
        {title}
      </h3>
      <div className="mt-1">{children}</div>
    </section>
  );
}

export function EditorHelpModal({ onClose, open }: EditorHelpModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;

      const focusable = [
        ...dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKey);
    dialog?.focus();

    return () => {
      document.removeEventListener("keydown", handleKey);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const trackCommands = SLASH_COMMANDS.filter((command) => command.kind === "track");

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-950/40 p-4 py-10 backdrop-blur-sm print:hidden"
      onClick={onClose}
    >
      <div
        aria-label="Editor guide"
        aria-modal="true"
        className="relative w-full max-w-lg rounded-xl border border-stone-200 bg-white p-6 text-stone-900 shadow-2xl outline-none dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
        onClick={(event) => event.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="m-0 font-serif text-2xl tracking-wide">Editor guide</h2>
          <button
            aria-label="Close"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-50"
            onClick={onClose}
            type="button"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Type <code className="font-mono">/</code> for the command menu. Click any box, circle
          or diamond to fill it in.
        </p>

        <Section title="Text">
          <Row code="# ">Expedition title</Row>
          <Row code="## ">Section heading</Row>
          <Row code="- ">Bullet list</Row>
          <Row code="**bold**">Bold — for pressure</Row>
          <Row code="_italic_">Italic — for whispers</Row>
        </Section>

        <Section title="Checkboxes & tracks">
          <Row code="- [ ] ">
            <span className="inline-flex items-center gap-2">
              Checklist item — click to tick
              <TrackPreview count={1} shape="box" />
            </span>
          </Row>
          {trackCommands.map((command) => (
            <Row code={`/${command.name} ${command.defaultCount}`} key={command.name}>
              <span className="inline-flex items-center gap-2">
                {command.description}
                {command.shape && (
                  <TrackPreview count={command.defaultCount} shape={command.shape} />
                )}
              </span>
            </Row>
          ))}
        </Section>

        <Section title="Game elements">
          <Row code="/monster-move">
            <p className="rpg-monster-move m-0">Lash out when cornered.</p>
          </Row>
          <Row code="/question">
            <p className="rpg-question m-0">What does the village fear most?</p>
          </Row>
        </Section>
      </div>
    </div>
  );
}
