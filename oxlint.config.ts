import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "warn",
  },
  rules: {
    "ts/no-redeclare": "off",
    "eslint-comments/no-unlimited-disable": "off",
    "style/brace-style": ["error", "1tbs"],
    "test/prefer-lowercase-title": "off",
  },
  stylistic: {
    semi: true,
    quotes: "double",
  },
});
