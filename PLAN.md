1. Move to TypeScript.
   - Ensure there's no .jsx files in the repo.
2. Move to Astro.
   - Use Astro with React integration for static site generation.
   - Main content is server-rendered (no client-side state).
3. Use plain HTML inputs for move toggles.
   - Dumb components work without JavaScript.
   - Progressive enhancement via sidecar storage component.
4. Sidecar storage component (client:load).
   - Syncs checkbox state to localStorage.
   - Restores state on page load.
5. Use only Avara font (already in repo).
   - Move fonts to public/ directory.
   - Remove Google Fonts reference to Averia.
6. Test that the website works and renders correctly.
