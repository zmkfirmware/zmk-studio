import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import storybook from "eslint-plugin-storybook";
import reactRefresh from "eslint-plugin-react-refresh";

export default defineConfig([
  { files: ["**/*.{mjs,cjs,js,jsx,ts,tsx}"] },
  globalIgnores(["dist/", "src-tauri/", "storybook-static/"]),
  {
    plugins: { js },
    extends: ["js/recommended"],
  },
  tseslint.configs.strict,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  reactHooks.configs["recommended-latest"],
  ...storybook.configs["flat/recommended"],
  reactRefresh.configs.vite,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      "no-constant-condition": "off",
      "react/display-name": "off",
      "react/jsx-key": "off",
      "react/jsx-no-target-blank": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
]);
