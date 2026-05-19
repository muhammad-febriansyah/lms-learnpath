import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Poppins', {
                    weights: [400, 500, 600, 700, 800],
                }),
            ],
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    resolve: {
        dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
        include: ['motion/react'],
    },
    // Bind dev server to IPv4 so Laravel renders asset URLs as
    // http://127.0.0.1:5173 instead of http://[::1]:5173. IPv6 host literals
    // are not part of the CSP host-source spec, so they get blocked.
    server: {
        host: '127.0.0.1',
        hmr: { host: '127.0.0.1' },
    },
});
