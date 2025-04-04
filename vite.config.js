import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/life-in-franklin/", // Ensures correct path resolution on GitHub Pages
});
