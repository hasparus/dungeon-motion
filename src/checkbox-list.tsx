import React, { useId } from "react";

import { cn } from "./cn";

type Variant = "compendium-move" | "instinct" | "small" | "small" | "traits";

const variantStyles: Record<
  Variant,
  { checkbox: string; container: string; label: string }
> = {
  "compendium-move": {
    checkbox: "size-4 aspect-square shrink-0",
    container: "space-y-6",
    label: "flex items-start gap-2 cursor-pointer",
  },
  instinct: {
    checkbox: "size-3 -mt-0.75 aspect-square shrink-0",
    container:
      "grid grid-cols-2 gap-2 text-sm text-stone-700 dark:text-stone-300",
    label: "flex items-center gap-2 cursor-pointer",
  },
  small: {
    checkbox:
      "size-3.25 aspect-square shrink-0 inline mr-1.5 translate-y-[-.5px]",
    container: "space-y-2 text-sm text-stone-700 dark:text-stone-300",
    label: "cursor-pointer block",
  },
  traits: {
    checkbox: "size-3 aspect-square shrink-0 -mt-0.5",
    container:
      "flex flex-wrap gap-x-4 gap-y-1 text-stone-600 dark:text-stone-400 text-sm",
    label: "flex items-center gap-1 cursor-pointer",
  },
};

interface CheckboxListProps {
  className?: string;
  items: React.ReactNode[];
  variant: Variant;
}

export function CheckboxList({ className, items, variant }: CheckboxListProps) {
  const styles = variantStyles[variant];
  const id = useId();

  return (
    <div className={cn(styles.container, className)}>
      {items.map((item, i) => (
        <label className={styles.label} key={i}>
          <input
            className={styles.checkbox}
            name={`${id}-${i}`}
            type="checkbox"
          />
          {item}
        </label>
      ))}
    </div>
  );
}
