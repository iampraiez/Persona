import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    host: "localhost",
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("recharts") || id.includes("lodash")) {
              return "charts";
            }
            if (id.includes("framer-motion")) {
              return "framer";
            }
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
  },
});
