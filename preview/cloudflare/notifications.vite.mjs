import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
const path = base => fileURLToPath(new URL(base,import.meta.url));
export default defineConfig({
  root:path('.'),publicDir:false,plugins:[react()],
  build:{outDir:path('./baseline/dist'),emptyOutDir:false,rollupOptions:{input:path('./notifications.html')}},
});
