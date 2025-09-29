import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    root: 'client',
    build: {
        outDir: 'client/dist',
        emptyOutDir: true,
        sourcemap: true,
    },
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'client/src'),
        },
    },
});
