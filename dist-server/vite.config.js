import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
export default defineConfig(({ mode }) => {
    const plugins = [
        react({ jsxRuntime: "automatic" })
    ];
    const requiredPublicEnvVars = [
        'VITE_STACK_PROJECT_ID',
        'VITE_STACK_PUBLISHABLE_CLIENT_KEY'
    ];
    for (const envVar of requiredPublicEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`Missing required public environment variable: ${envVar}`);
        }
    }
    return {
        plugins,
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
                react: path.resolve(__dirname, "node_modules/react"),
                "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
                "@": path.resolve(__dirname, "client", "src"),
                "@shared": path.resolve(__dirname, "shared"),
                "@assets": path.resolve(__dirname, "attached_assets"),
            },
        },
        root: path.resolve(__dirname, "client"),
        build: {
            outDir: path.resolve(__dirname, "client/dist"),
            emptyOutDir: true,
            chunkSizeWarningLimit: 1200,
            rollupOptions: {
                input: path.resolve(__dirname, "client/index.html"),
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            if (id.includes('@stackframe') || id.includes('react')) {
                                return 'vendor';
                            }
                            return 'deps';
                        }
                        if (id.includes('components/') || id.includes('shared/ui/')) {
                            return 'ui';
                        }
                        return undefined;
                    }
                }
            },
            sourcemap: mode === 'development',
            minify: 'esbuild',
        },
        server: {
            host: "0.0.0.0",
            port: parseInt(process.env['PORT'] || "8080"),
            fs: { strict: false },
        },
        optimizeDeps: {
            include: ["react", "react-dom"],
        },
        ssr: {
            noExternal: ["@stackframe/react"],
        },
    };
});
//# sourceMappingURL=vite.config.js.map