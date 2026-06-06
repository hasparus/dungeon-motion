import { useRef, useState } from "react";

import {
  isFileAccessSupported,
  pickFileToCreate,
  pickFileToOpen,
  readDocument,
  writeDocument,
} from "./editor-files";

export type FileStatus = "error" | "saved" | "saving";

export interface LinkedFile {
  close: (html?: string) => Promise<void>;
  flushWrite: (html: string) => Promise<void>;
  name: string | null;
  open: () => Promise<string | null>;
  queue: (html: string) => void;
  save: (html: string) => Promise<boolean>;
  status: FileStatus;
  supported: boolean;
}

const WRITE_DEBOUNCE_MS = 600;

export function useLinkedFile(): LinkedFile {
  const [supported] = useState(isFileAccessSupported);
  const [name, setName] = useState<string | null>(null);
  const [status, setStatus] = useState<FileStatus>("saved");
  const handle = useRef<FileSystemFileHandle | null>(null);
  const pending = useRef<string | null>(null);
  const writing = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function drain() {
    if (writing.current || !handle.current || pending.current === null) return;
    writing.current = true;
    setStatus("saving");
    try {
      while (handle.current && pending.current !== null) {
        const html = pending.current;
        pending.current = null;
        await writeDocument(handle.current, html);
      }
      setStatus("saved");
    } catch (error) {
      console.warn("text-editor: file save failed", error);
      setStatus("error");
    } finally {
      writing.current = false;
    }
  }

  function clearTimer() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }

  function queue(html: string) {
    if (!handle.current) return;
    pending.current = html;
    if (timer.current) return;
    timer.current = setTimeout(() => {
      timer.current = null;
      void drain();
    }, WRITE_DEBOUNCE_MS);
  }

  async function flushWrite(html: string) {
    if (!handle.current) return;
    pending.current = html;
    clearTimer();
    await drain();
  }

  async function open(): Promise<string | null> {
    const picked = await pickFileToOpen();
    if (!picked) return null;
    try {
      const html = await readDocument(picked);
      handle.current = picked;
      pending.current = null;
      setName(picked.name);
      setStatus("saved");
      return html;
    } catch (error) {
      console.warn("text-editor: could not open file", error);
      setStatus("error");
      return null;
    }
  }

  async function save(html: string): Promise<boolean> {
    if (!handle.current) {
      const picked = await pickFileToCreate();
      if (!picked) return false;
      handle.current = picked;
      setName(picked.name);
    }
    await flushWrite(html);
    return true;
  }

  async function close(html?: string) {
    if (html !== undefined) await flushWrite(html);
    clearTimer();
    handle.current = null;
    pending.current = null;
    setName(null);
    setStatus("saved");
  }

  return { close, flushWrite, name, open, queue, save, status, supported };
}
