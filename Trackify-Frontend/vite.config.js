import path, { dirname } from "path";
import { fileURLToPath } from "url";
import reactVitePlugin from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  appType: "spa",
  build: {
    outDir: "build",
    // minify: "terser",
    // cssMinify: true,
    // assetsDir: "assets",
  },
  plugins: [reactVitePlugin()],
  resolve: {
    alias: {
      "##": path.resolve(__dirname, "."),
    },
  },
  esbuild: {
    loader: "jsx",
  },
});

