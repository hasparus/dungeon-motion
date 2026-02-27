import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";

const ROOM_PREFIX = "dungeon-motion-";

function getRoom(): string {
  const hash = globalThis.location?.hash?.slice(1);
  if (hash) return ROOM_PREFIX + hash;
  const id = Math.random().toString(36).slice(2, 8);
  globalThis.location.hash = id;
  return ROOM_PREFIX + id;
}

/**
 * Binds a Y.Map to all named form elements inside a <form>.
 * Remote changes update DOM directly. Local input events push to the map.
 */
function bindForm(form: HTMLFormElement, ymap: Y.Map<string | boolean>) {
  let suppressing = false;

  // Push local → ymap
  const onInput = () => {
    if (suppressing) return;
    for (const el of form.elements) {
      const f = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (!f.name) continue;
      if (f instanceof HTMLInputElement && f.type === "checkbox") {
        ymap.set(f.name, f.checked);
      } else {
        ymap.set(f.name, f.value);
      }
    }
  };

  const onChange = onInput;

  // Pull ymap → DOM
  const observer = () => {
    suppressing = true;
    for (const el of form.elements) {
      const f = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (!f.name) continue;
      const v = ymap.get(f.name);
      if (v === undefined) continue;
      if (f instanceof HTMLInputElement && f.type === "checkbox") {
        f.checked = v as boolean;
      } else if (f.value !== v) {
        f.value = v as string;
      }
    }
    suppressing = false;
  };

  ymap.observe(observer);
  form.addEventListener("input", onInput);
  form.addEventListener("change", onChange);

  // Seed from existing form state on connect
  for (const el of form.elements) {
    const f = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (!f.name) continue;
    // Only seed if ymap doesn't already have a value (don't overwrite remote state)
    if (ymap.has(f.name)) continue;
    if (f instanceof HTMLInputElement && f.type === "checkbox") {
      if (f.checked) ymap.set(f.name, true);
    } else if (f.value) {
      ymap.set(f.name, f.value);
    }
  }

  // Apply remote state that already exists
  if (ymap.size > 0) observer();

  return () => {
    ymap.unobserve(observer);
    form.removeEventListener("input", onInput);
    form.removeEventListener("change", onChange);
  };
}

export function Multiplayer() {
  const [peers, setPeers] = useState(0);
  const [room, setRoom] = useState("");
  const docRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebrtcProvider | null>(null);

  useEffect(() => {
    const roomName = getRoom();
    setRoom(globalThis.location.hash.slice(1));

    const doc = new Y.Doc();
    const provider = new WebrtcProvider(roomName, doc, {
      signaling: ["wss://y-webrtc-eu.fly.dev"],
    });
    docRef.current = doc;
    providerRef.current = provider;

    const ymap = doc.getMap<string | boolean>("sheet");

    // Wait for form to mount
    const form = document.querySelector("form");
    let unbind: (() => void) | undefined;
    if (form) {
      unbind = bindForm(form, ymap);
    }

    // Track peers
    const updatePeers = () => {
      setPeers(provider.awareness.getStates().size - 1);
    };
    provider.awareness.on("change", updatePeers);
    updatePeers();

    return () => {
      unbind?.();
      provider.awareness.off("change", updatePeers);
      provider.disconnect();
      provider.destroy();
      doc.destroy();
    };
  }, []);

  if (!room) return null;

  return (
    <div className="fixed top-3 left-3 print:hidden flex items-center gap-2 z-50">
      <div className="flex items-center gap-1.5">
        <div
          className={`size-1.5 rounded-full ${peers > 0 ? "bg-emerald-500" : "bg-stone-400 dark:bg-stone-600"}`}
        />
        <span className="text-[10px] tracking-widest uppercase text-stone-400/70 dark:text-stone-500/70">
          {peers > 0 ? `${peers + 1} connected` : "solo"}
        </span>
      </div>
      <button
        className="text-[10px] tracking-widest uppercase text-stone-400/70 dark:text-stone-500/70 hover:text-stone-600 dark:hover:text-stone-300 focus-visible:text-stone-600 dark:focus-visible:text-stone-300 focus-visible:underline underline-offset-2 outline-none transition-colors cursor-pointer"
        onClick={() => {
          const url = globalThis.location.href;
          navigator.clipboard.writeText(url);
        }}
        type="button"
      >
        [ Copy link ]
      </button>
    </div>
  );
}
