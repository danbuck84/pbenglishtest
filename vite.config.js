import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split React into its own chunk
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Split Firebase into its own chunk (it's usually the heaviest)
          'vendor-firebase': ['firebase/app', 'firebase/firestore'],
          // Split Gemini SDK into its own chunk
          'vendor-gemini': ['@google/generative-ai'],
        }
      }
    }
  }
});
