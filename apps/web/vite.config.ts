import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  cacheDir: "C:/Users/vikasreddy/AppData/Local/foodbridge-vite-cache",

  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});