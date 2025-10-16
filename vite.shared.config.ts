import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sharedConfig: UserConfig = {
  plugins: [
    react({
      jsxRuntime: "automatic",
      jsxImportSource: "react",
      babel: {
        parserOpts: {
          plugins: ['jsx', 'typescript']
        }
      }
    })
  ],
  
  css: {
    postcss: {
      plugins: [
        tailwindcss({
          config: './client/tailwind.config.ts'
        }),
        autoprefixer(),
      ],
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, "client", "src"),
      '@shared': path.resolve(__dirname, "shared"),
      '@assets': path.resolve(__dirname, "attached_assets"),
      '@lib': path.resolve(__dirname, "client", "src", "lib"),
      'react': path.resolve(__dirname, "node_modules/react"),
      'react-dom': path.resolve(__dirname, "node_modules/react-dom"),
    },
    dedupe: [
      'react', 
      'react-dom', 
      '@stackframe/react',
      '@stackframe/react/dist/esm/components/auth',
      '@stackframe/react/dist/esm/components/user-button',
      '@stackframe/react/dist/esm/components-page/stack-handler'
    ]
  },

  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
    target: ['esnext'],
    legalComments: 'none',
    define: {
      global: 'globalThis'
    },
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        useDefineForClassFields: true,
        jsx: 'preserve'
      }
    }
  },

  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      '@stackframe/react',
      '@stackframe/react/dist/esm/components/auth/**',
      '@stackframe/react/dist/esm/components/user-button',
      '@stackframe/react/dist/esm/components-page/stack-handler',
      '@radix-ui/**',
      'cmdk',
      'lucide-react'
    ],
    exclude: [],
    force: true
  }
};

export default sharedConfig;