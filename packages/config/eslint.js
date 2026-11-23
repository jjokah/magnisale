import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

/** Server code. It must never reach a browser bundle. */
const SERVER_ONLY = [
  "@magnisale/db",
  "@magnisale/db/*",
  "@magnisale/auth",
  "@magnisale/auth/*",
  "@magnisale/queue",
  "@magnisale/queue/*",
  "@magnisale/integrations",
  "@magnisale/integrations/*",
  "@magnisale/agent-core",
  "@magnisale/agent-core/*",
  "@magnisale/profiler/server",
];

const OTHER_APPS = ["@magnisale/web", "@magnisale/platform", "@magnisale/workers"];

const restricted = (patterns) => ({
  "@typescript-eslint/no-restricted-imports": ["error", { patterns }],
});

const noServerCode = {
  group: SERVER_ONLY,
  message: "Server code cannot be imported into a browser app.",
};

export default defineConfig([
  globalIgnores(["**/dist", "**/node_modules", "**/.astro", "**/.turbo", ".playwright-mcp", "**/routeTree.gen.ts"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2023, globals: globals.node },
    rules: {
      // A leading underscore marks a parameter kept for its position or type.
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["**/tests/**/*.ts"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },
  {
    files: ["apps/web/**/*.{ts,tsx}", "apps/platform/**/*.{ts,tsx}", "packages/ui/**/*.{ts,tsx}"],
    extends: [reactHooks.configs.flat.recommended],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["apps/web/**/*.{ts,tsx}", "packages/ui/**/*.{ts,tsx}"],
    rules: restricted([
      noServerCode,
      { group: ["@magnisale/api", "@magnisale/api/*", ...OTHER_APPS], message: "Apps do not import each other." },
    ]),
  },
  {
    files: ["apps/platform/**/*.{ts,tsx}"],
    rules: restricted([
      noServerCode,
      // The typed client needs the API's types and nothing else from it.
      {
        group: ["@magnisale/api", "@magnisale/api/*"],
        allowTypeImports: true,
        message: "The platform may import only types from the API.",
      },
      { group: ["@magnisale/web", "@magnisale/workers"], message: "Apps do not import each other." },
    ]),
  },
  {
    files: ["apps/api/**/*.ts", "apps/workers/**/*.ts"],
    rules: restricted([
      {
        group: ["@magnisale/api", "@magnisale/api/*", ...OTHER_APPS],
        message: "Apps do not import each other. Move shared logic into a package.",
      },
    ]),
  },
]);
