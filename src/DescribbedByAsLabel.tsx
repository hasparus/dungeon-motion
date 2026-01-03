// All inputs with `aria-describedby` register a listener on the element that is described by the id in the `aria-describedby` attribute.
// Clicking the "label" will toggle the input.

import { useEffect } from "react";

export const DescribbedByAsLabel = () => {
  useEffect(() => {
    const inputs = document.querySelectorAll<HTMLInputElement>(
      "input[aria-describedby]"
    );

    const handlers = new WeakMap<HTMLInputElement, () => void>();

    inputs.forEach((input) => {
      const describedBy = input.getAttribute("aria-describedby");
      if (!describedBy) return;
      const describedElement = document.getElementById(describedBy);
      if (describedElement) {
        const handleClick = () => input.click();
        describedElement.addEventListener("click", handleClick);
        describedElement.style.cursor = "pointer";
        handlers.set(input, handleClick);
      }
    });

    return () => {
      inputs.forEach((input) => {
        const handleClick = handlers.get(input);
        if (handleClick) {
          input.removeEventListener("click", handleClick);
        }
      });
    };
  }, []);

  return null;
};
