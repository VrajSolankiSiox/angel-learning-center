import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { localEnrollmentApiPlugin } from './vite-local-enrollment-api.js';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), localEnrollmentApiPlugin(env)],
    publicDir: 'public',
    server: {
      port: 8765,
      // Other /api routes only; submit-enrollment is handled by vite-local-enrollment-api.js
      proxy: {
        '/api': {
          target: process.env.VITE_API_PROXY_TARGET || 'https://angel-learning-enrollment.vercel.app',
          changeOrigin: true,
        },
      },
    },
  };
});
