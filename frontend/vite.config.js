import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // any request starting with /api gets sent to your backend
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
        // optional rewrite if your backend path differs
        rewrite: (path) => path.replace(/^\/api/, "/api/v1"),
      },
    },
  },
});
