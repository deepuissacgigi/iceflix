import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React — changes rarely, cached long-term
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          'ui-vendor': ['framer-motion', 'lucide-react'],
          // Backend SDK
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
})
