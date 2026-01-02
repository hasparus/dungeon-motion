import React from "react";

type CheckboxItemSimple = string;

type CheckboxItemWithDetail = {
  name: string;
  detail: string;
  /** separator between name and detail, defaults to " " */
  separator?: string;
};

type CheckboxItemWithDescription = {
  id: string;
  title: string;
  description: React.ReactNode;
  /** optional trailing element in the header row */
  trailing?: React.ReactNode;
};

type CheckboxItem =
  | CheckboxItemSimple
  | CheckboxItemWithDetail
  | CheckboxItemWithDescription;

type Variant = "traits" | "instinct" | "armament" | "bane" | "monster-move";

const variantStyles: Record<
  Variant,
  {
    container: string;
    item: string;
    checkbox: string;
    labelClass: string;
  }
> = {
  traits: {
    container: "flex flex-wrap gap-x-4 gap-y-1 text-stone-600 dark:text-stone-400 text-sm",
    item: "",
    checkbox: "w-3 h-3",
    labelClass: "flex items-center gap-1 cursor-pointer",
  },
  instinct: {
    container: "grid grid-cols-2 gap-2 text-sm text-stone-700 dark:text-stone-300",
    item: "",
    checkbox: "w-3 h-3 -mt-0.5",
    labelClass: "flex items-center gap-2 cursor-pointer",
  },
  armament: {
    container: "space-y-2 text-sm",
    item: "flex gap-2 text-stone-700 dark:text-stone-300",
    checkbox: "w-3 h-3 mt-0.75",
    labelClass: "flex gap-2 cursor-pointer",
  },
  bane: {
    container: "space-y-2 text-sm text-stone-700 dark:text-stone-300",
    item: "",
    checkbox: "w-3 h-3 mt-0.5",
    labelClass: "flex gap-2 cursor-pointer",
  },
  "monster-move": {
    container: "space-y-6",
    item: "space-y-2",
    checkbox: "size-4 mt-[-3px]",
    labelClass: "flex items-center gap-2 cursor-pointer",
  },
};

function isSimple(item: CheckboxItem): item is CheckboxItemSimple {
  return typeof item === "string";
}

function hasDescription(
  item: CheckboxItem
): item is CheckboxItemWithDescription {
  return typeof item === "object" && "description" in item;
}

function hasDetail(item: CheckboxItem): item is CheckboxItemWithDetail {
  return typeof item === "object" && "detail" in item;
}

interface CheckboxListProps {
  items: CheckboxItem[];
  variant: Variant;
}

export function CheckboxList({ items, variant }: CheckboxListProps) {
  const styles = variantStyles[variant];

  return (
    <div className={styles.container}>
      {items.map((item) => {
        const key = isSimple(item)
          ? item
          : hasDescription(item)
            ? item.id
            : item.name;

        if (hasDescription(item)) {
          // Monster move variant with title + description
          return (
            <div key={key} className={styles.item}>
              <label className={styles.labelClass}>
                <input type="checkbox" className={styles.checkbox} />
                <h5 className="font-bold text-stone-800 dark:text-stone-100 tracking-wide">
                  {item.title}
                </h5>
                {item.trailing && (
                  <span className="text-xs text-stone-500 dark:text-stone-400 ml-auto">
                    {item.trailing}
                  </span>
                )}
              </label>
              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed pl-6">
                {item.description}
              </p>
            </div>
          );
        }

        if (hasDetail(item)) {
          // Armament/Bane variant with name + detail
          const separator = item.separator ?? " ";
          return (
            <label key={key} className={styles.labelClass}>
              <input type="checkbox" className={styles.checkbox} />
              <span>
                <strong>{item.name}</strong>
                {separator}
                {variant === "armament" ? (
                  <span className="text-stone-500 dark:text-stone-400">
                    {item.detail}
                  </span>
                ) : (
                  item.detail
                )}
              </span>
            </label>
          );
        }

        // Simple string variant
        return (
          <label key={key} className={styles.labelClass}>
            <input type="checkbox" className={styles.checkbox} />
            {item}
          </label>
        );
      })}
    </div>
  );
}
