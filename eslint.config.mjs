import { createRequire } from "module";
import jsxA11y from "eslint-plugin-jsx-a11y";

const require = createRequire(import.meta.url);
const nextConfig = require("eslint-config-next/core-web-vitals");
const nextTypescript = require("eslint-config-next/typescript");

// Extract recommended rules from jsx-a11y as warnings (plugin already registered by next/core-web-vitals)
const a11yRules = Object.fromEntries(
  Object.entries(jsxA11y.configs.recommended.rules ?? {}).map(([key]) => [key, "warn"])
);

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "docs/**",
      "backups/**",
      "scripts/**",
      "next.config.js",
    ],
  },
  ...nextConfig,
  ...nextTypescript,
  {
    rules: {
      ...a11yRules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "react/no-unescaped-entities": "warn",
    },
  },
];

export default eslintConfig;
