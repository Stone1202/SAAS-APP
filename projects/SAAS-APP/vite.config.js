import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
export default defineConfig({
    base: process.env.VITE_BASE_PATH || './',
    plugins: [vue()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    build: {
        rollupOptions: {
            input: {
                admin: resolve(__dirname, 'admin.html'),
                tenant: resolve(__dirname, 'tenant.html'),
                app: resolve(__dirname, 'app.html'),
            },
        },
    },
    server: {
        port: 5174,
        open: '/app.html',
    },
});
