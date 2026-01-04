import React from "react";

type Variant = "armament" | "bane" | "instinct" | "monster-move" | "traits";

const variantStyles: Record<
  Variant,
  { checkbox: string; container: string; label: string }
> = {
  armament: {
    checkbox: "w-3 h-3 mt-0.75",
    container: "space-y-2 text-sm text-stone-700 dark:text-stone-300",
    label: "flex gap-2 flex-wrap cursor-pointer",
  },
  bane: {
    checkbox: "w-3 h-3 mt-0.5",
    container: "space-y-2 text-sm text-stone-700 dark:text-stone-300",
    label: "flex gap-2 flex-wrap cursor-pointer",
  },
  instinct: {
    checkbox: "w-3 h-3 -mt-0.5",
    container:
      "grid grid-cols-2 gap-2 text-sm text-stone-700 dark:text-stone-300",
    label: "flex items-center gap-2 cursor-pointer",
  },
  "monster-move": {
    checkbox: "size-4",
    container: "space-y-6",
    label: "flex items-start gap-2 cursor-pointer",
  },
  traits: {
    checkbox: "w-3 h-3",
    container:
      "flex flex-wrap gap-x-4 gap-y-1 text-stone-600 dark:text-stone-400 text-sm",
    label: "flex items-center gap-1 cursor-pointer",
  },
};

interface CheckboxListProps {
  items: React.ReactNode[];
  variant: Variant;
}

export function CheckboxList({ items, variant }: CheckboxListProps) {
  const styles = variantStyles[variant];

  return (
    <div className={styles.container}>
      {items.map((item, i) => (
        <label className={styles.label} key={i}>
          <input className={styles.checkbox} type="checkbox" />
          {item}
        </label>
      ))}
    </div>
  );
}
