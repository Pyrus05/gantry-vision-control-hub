
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy API requests to the Flask backend when developing
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimize for Raspberry Pi's limited resources
  build: {
    // Reduce chunk size for better performance on RPi
    chunkSizeWarningLimit: 600,
    // Minify for production
    minify: true,
    // Target older browsers for better compatibility
    target: 'es2015',
    // Reduce build size
    sourcemap: false,
    // Adjust for Raspberry Pi
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: [
            '@/components/ui/button',
            '@/components/ui/card',
            '@/components/ui/input',
            '@/components/ui/select',
            '@/components/ui/slider',
          ],
        },
      },
    },
  },
}));
