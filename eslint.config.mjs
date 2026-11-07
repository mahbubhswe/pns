import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  // Never lint build output, generated code, dependencies or user uploads.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "node_modules/**",
    "lib/generated/**",
    "public/**",
    "next-env.d.ts",
  ]),
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // `any` is tolerated at the edges (legacy UI code) but should not spread.
      // New server code under lib/server and features/ must stay `any`-free.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
      "react-hooks/exhaustive-deps": "warn",
      // React Compiler readiness rules (new in eslint-config-next 16). The app
      // does not use the compiler yet and legacy UI code trips them; keep them
      // visible as warnings and fix when touching those components.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
    },
  },
  {
    // Server foundation + feature modules are held to a stricter standard.
    files: ["lib/server/**/*.ts", "lib/config/**/*.ts", "features/**/*.ts", "features/**/*.tsx", "types/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    // Plain Node scripts use CommonJS on purpose.
    files: ["scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);
