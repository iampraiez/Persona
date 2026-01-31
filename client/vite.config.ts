import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ["lucide-react", "recharts"],
  },
  server: {
    host: "localhost",
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Only split common, stable vendor libraries
          // Let Vite handle dynamic imports automatically
          if (id.includes("node_modules")) {
            // Group React and React-related libraries together
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
              return "react-vendor";
            }
            // Other utilities
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
  },
});
