import { useEffect } from "react";

export const CheckboxStorage = () => {
  useEffect(() => {
    const form = document.querySelector("form");
    if (!form) return;

    // --- Checkbox persistence ---
    const STORAGE_KEY = "dungeon-motion-selections";
    const checkboxes = form.querySelectorAll<HTMLInputElement>(
      'input[type="checkbox"]'
    );

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

    const handleChange = () => {
      const selected: Record<string, boolean> = {};
      for (const cb of checkboxes) {
        if (cb.name) selected[cb.name] = cb.checked;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    };

    for (const cb of checkboxes) {
      cb.addEventListener("change", handleChange);
    }

    // --- Text/number/textarea/select persistence ---
    const FIELDS_KEY = "dungeon-motion-fields";
    const fields = form.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >('input[type="text"], input[type="number"], textarea, select');

    const savedFields = localStorage.getItem(FIELDS_KEY);
    if (savedFields) {
      try {
        const values: Record<string, string> = JSON.parse(savedFields);
        for (const field of fields) {
          if (field.name && values[field.name] !== undefined) {
            field.value = values[field.name];
          }
        }
      } catch (error) {
        console.warn("Failed to parse saved fields", error);
      }
    }

    let debounceTimer: ReturnType<typeof setTimeout>;
    const handleFieldInput = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const values: Record<string, string> = {};
        for (const field of fields) {
          if (field.name) values[field.name] = field.value;
        }
        localStorage.setItem(FIELDS_KEY, JSON.stringify(values));
      }, 300);
    };

    for (const field of fields) {
      field.addEventListener("input", handleFieldInput);
    }

    document.body.dataset.hydrated = "true";

    return () => {
      clearTimeout(debounceTimer);
      for (const cb of checkboxes) {
        cb.removeEventListener("change", handleChange);
      }
      for (const field of fields) {
        field.removeEventListener("input", handleFieldInput);
      }
    };
  }, []);

  return null;
};
