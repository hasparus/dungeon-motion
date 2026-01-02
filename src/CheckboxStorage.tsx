import { useEffect } from "react";

const CheckboxStorage = () => {
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
        checkboxes.forEach((cb) => {
          if (selected[cb.value]) {
            cb.checked = true;
          }
        });
      } catch (e) {
        console.warn("Failed to parse saved moves", e);
      }
    }

    // Save state on change
    const handleChange = () => {
      const selected: Record<string, boolean> = {};
      checkboxes.forEach((cb) => {
        selected[cb.value] = cb.checked;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    };

    checkboxes.forEach((cb) => {
      cb.addEventListener("change", handleChange);
    });

    return () => {
      checkboxes.forEach((cb) => {
        cb.removeEventListener("change", handleChange);
      });
    };
  }, []);

  return null;
};

export default CheckboxStorage;
