# Agent Guidelines

## Package Manager

Use **Bun** instead of npm or yarn.

```bash
# Install dependencies
bun install

# Run dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Add a dependency
bun add <package>
bun add -D <package>
```

Bun is faster and generates a lockfile that's compatible with the rest of the ecosystem.
