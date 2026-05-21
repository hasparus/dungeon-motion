import { type ReactNode, useEffect, useRef } from "react";

import { SLASH_COMMANDS, TrackPreview } from "./editor-atoms";
import "./editor-help-modal.css";

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

// Native <dialog>: showModal() gives a real focus trap, Esc handling and
// top-layer rendering for free; the open/close animation lives in
// editor-help-modal.css. The element stays mounted so the exit transition
// can play before the browser hides it.
export function EditorHelpModal({ onClose, open }: EditorHelpModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  const trackCommands = SLASH_COMMANDS.filter((command) => command.kind === "track");

  return (
    <dialog
      aria-label="Editor guide"
      className="te-help-dialog w-[calc(100vw-2rem)] max-w-lg rounded-xl border border-stone-200 bg-white text-stone-900 shadow-2xl dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 print:hidden"
      // The inner div covers the whole visible card; a click outside it landed
      // on the ::backdrop (or the dialog's own margin), so dismiss.
      onClick={(event) => {
        const inner = innerRef.current;
        if (inner && !inner.contains(event.target as Node)) onClose();
      }}
      onClose={onClose}
      ref={dialogRef}
    >
      <div className="p-6" ref={innerRef}>
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
          Type <code className="font-mono">/</code> for the command menu. Click any square,
          circle or rhomb to fill it in.
        </p>

        <Section title="Text">
          <Row code="# ">Heading</Row>
          <Row code="## ">Subheading</Row>
          <Row code="- ">Bullet list</Row>
          <Row code="1. ">Numbered list</Row>
          <Row code="**bold**">
            Turns a word <strong>bold</strong>
          </Row>
          <Row code="_italic_">
            Turns a word <i>italic</i>
          </Row>
        </Section>

        <Section title="Checkboxes & tracks">
          <Row code="- [ ] ">
            <span className="inline-flex items-center gap-2">
              Checklist item — click to tick
              <TrackPreview count={1} shape="square" />
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

        <Section title="Marker lines">
          <Row code="/arrow">
            <p className="te-arrow m-0">A line that points to something.</p>
          </Row>
          <Row code="/chevron">
            <p className="te-chevron m-0">A quieter line, set aside.</p>
          </Row>
        </Section>
      </div>
    </dialog>
  );
}
