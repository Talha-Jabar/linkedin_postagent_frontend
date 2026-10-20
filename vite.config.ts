import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // The backend only allows this origin (CORS_ORIGINS); fail instead of silently moving ports.
    strictPort: true,
  },
});
