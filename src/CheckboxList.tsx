import React from "react";

type Variant = "traits" | "instinct" | "armament" | "bane" | "monster-move";

const variantStyles: Record<
  Variant,
  { container: string; checkbox: string; label: string }
> = {
  traits: {
    container:
      "flex flex-wrap gap-x-4 gap-y-1 text-stone-600 dark:text-stone-400 text-sm",
    checkbox: "w-3 h-3",
    label: "flex items-center gap-1 cursor-pointer",
  },
  instinct: {
    container:
      "grid grid-cols-2 gap-2 text-sm text-stone-700 dark:text-stone-300",
    checkbox: "w-3 h-3 -mt-0.5",
    label: "flex items-center gap-2 cursor-pointer",
  },
  armament: {
    container: "space-y-2 text-sm text-stone-700 dark:text-stone-300",
    checkbox: "w-3 h-3 mt-0.75",
    label: "flex gap-2 cursor-pointer",
  },
  bane: {
    container: "space-y-2 text-sm text-stone-700 dark:text-stone-300",
    checkbox: "w-3 h-3 mt-0.5",
    label: "flex gap-2 cursor-pointer",
  },
  "monster-move": {
    container: "space-y-6",
    checkbox: "size-4",
    label: "flex items-start gap-2 cursor-pointer",
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
        <label key={i} className={styles.label}>
          <input type="checkbox" className={styles.checkbox} />
          {item}
        </label>
      ))}
    </div>
  );
}
