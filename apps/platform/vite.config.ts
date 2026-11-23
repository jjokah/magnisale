import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tanstackRouter({ target: "react", autoCodeSplitting: true }), react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    // Same origin as in production, where Caddy routes /api to the API.
    proxy: {
      "/api": { target: "http://127.0.0.1:8080", xfwd: true },
    },
  },
});
