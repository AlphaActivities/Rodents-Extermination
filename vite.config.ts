import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://nlqsvzbtbspflyozrvds.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5scXN2emJ0YnNwZmx5b3pydmRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzODU4MzIsImV4cCI6MjA5NDk2MTgzMn0.XAkwxMp2uAO0-HP2iyEYPSFa_0tjkTFxplC-JlbQL8k'),
  },
});
