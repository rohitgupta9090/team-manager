import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Keeps Vite cache outside node_modules — avoids `npm ci` EBUSY on Railway/Docker
  // when the builder tries to remove `node_modules/.vite` while it's locked.
  cacheDir: ".vite-cache",
});
