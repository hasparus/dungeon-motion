import React from "react";

import { cn } from "./cn";

export const Tag = ({
  children,
  handwritten = false,
}: {
  children: React.ReactNode;
  handwritten?: boolean;
}) => (
  <span
    className={cn(
      "text-stone-900 dark:text-stone-100",
      handwritten
        ? "font-hand text-lg leading-none [text-box-trim:trim-end] -translate-y-px text-stone-700 dark:text-stone-300 [text-box-edge:cap_alphabetic]"
        : "italic"
    )}
  >
    {children}
  </span>
);
