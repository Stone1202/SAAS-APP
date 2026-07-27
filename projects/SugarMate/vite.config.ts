import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src"),
    "@contracts": path.resolve(__dirname, "src/contracts"),
    "@adapters": path.resolve(__dirname, "src/adapters"),
    "@services": path.resolve(__dirname, "src/services") } },
  server: { port: parseInt(process.env.VITE_DEV_PORT || "3333"), host: true },
}));
