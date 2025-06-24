import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());

    return {
        test: {
            // Your Vitest settings here
            environment: 'jsdom', // or 'node' depending on your usage
            globals: true,
            setupFiles: ['./vitest.setup.ts'], // ✅ include your setup file
        },
        define: {
            'import.meta.env': JSON.stringify(env),
            'process.env': JSON.stringify(env),
        },
    };
});