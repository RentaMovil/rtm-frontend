import { defineConfig } from "eslint/config";
import expoConfig from "eslint-config-expo/flat.js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import reactHooks from "eslint-plugin-react-hooks";

export default defineConfig([
  ...expoConfig,
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: reactHooks.configs.recommended.rules,
  },
  eslintConfigPrettier,
  {
    ignores: [".expo/**", "coverage/**", "dist/**", "node_modules/**"],
  },
]);
