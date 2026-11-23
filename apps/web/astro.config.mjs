import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://magnisale.com",
  // Each page is served from folder/index.html (see wrangler.jsonc).
  trailingSlash: "always",
  build: { format: "directory", assets: "assets" },
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    // The year on the page until the browser can check it.
    define: { __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()) },
  },
});
