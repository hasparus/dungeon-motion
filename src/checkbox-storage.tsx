import { useEffect } from "react";

export const CheckboxStorage = () => {
  useEffect(() => {
    const form = document.querySelector("form");
    if (!form) return;

    const STORAGE_KEY = "dungeon-motion-selections";
    const checkboxes = form.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]'
    );

    // Load saved state from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const selected = JSON.parse(saved);
        for (const cb of checkboxes) {
          if (cb.name && selected[cb.name]) {
            cb.checked = true;
          }
        }
      } catch (error) {
        console.warn("Failed to parse saved moves", error);
      }
    }

    // Save state on change
    const handleChange = () => {
      const selected: Record<string, boolean> = {};
      for (const cb of checkboxes) {
        selected[cb.value] = cb.checked;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    };

    for (const cb of checkboxes) {
      cb.addEventListener("change", handleChange);
    }

    return () => {
      for (const cb of checkboxes) {
        cb.removeEventListener("change", handleChange);
      }
    };
  }, []);

  return null;
};
