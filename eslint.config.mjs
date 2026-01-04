// @ts-check

import eslint from "@eslint/js";
import perfectionistPlugin from "eslint-plugin-perfectionist";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

const objectsOrderOptions = {
  type: "natural",
  customGroups: [
    {
      elementNamePattern: "type|id",
      groupName: "frontmatter",
    },
  ],
  groups: ["frontmatter", "unknown"],
  order: "asc",
  partitionByComment: true,
};

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // interfaces don't have index signatures, what's needed for Cloudflare env
      "@typescript-eslint/consistent-type-definitions": "off",
    },
  },
  {
    extends: [perfectionistPlugin.configs["recommended-natural"]],
    rules: {
      "perfectionist/sort-object-types": ["warn", objectsOrderOptions],
      "perfectionist/sort-union-types": [
        "warn",
        {
          type: "natural",
          groups: ["unknown", "keyword", "nullish"],
          order: "asc",
        },
      ],
      "perfectionist/sort-classes": "off",
      "perfectionist/sort-enums": "off",
      "perfectionist/sort-imports": [
        "warn",
        {
          internalPattern: ["^#.*"],
        },
      ],
      "perfectionist/sort-jsx-props": "warn",
      "perfectionist/sort-modules": "off",
      "perfectionist/sort-objects": ["warn", objectsOrderOptions],
    },
  },
  eslintPluginUnicorn.configs.recommended,
  {
    rules: {
      "unicorn/import-style": "off",
      "unicorn/no-null": "off",
      "unicorn/prefer-query-selector": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/switch-case-braces": "off",
    },
  },
  {
    ignores: [
      "dist",
      ".astro",
      "src/routeTree.gen.ts",
      "node_modules",
      "**/.wrangler/tmp/**/*",
    ],
  }
);
