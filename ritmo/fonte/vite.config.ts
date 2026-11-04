import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O app publicado fica em ritmo/ (index.html + assets/), ao lado dos outros apps do repositório.
// O código-fonte fica em ritmo/fonte/.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { outDir: '..', emptyOutDir: false, assetsDir: 'assets', sourcemap: false },
});
