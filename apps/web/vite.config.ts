import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { blog } from "./scripts/blog-plugin.ts";

export default defineConfig({
  plugins: [blog(), react(), tailwindcss()],
  // The year of the build, shared by the client and prerender builds so the
  // footer's first render in the browser matches the prerendered page.
  define: { __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()) },
});
