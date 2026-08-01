import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En dev, /api et /files sont redirigés vers le serveur backend (port 4000)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:4000", changeOrigin: true },
      "/files": { target: "http://localhost:4000", changeOrigin: true },
    },
  },
});
