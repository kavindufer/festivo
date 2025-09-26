import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: '0.0.0.0'
    },
    define: {
      __APP_CONFIG__: JSON.stringify({
        apiBaseUrl: env.VITE_API_BASE_URL || 'http://localhost:8080',
        oidcUrl: env.VITE_OIDC_AUTH_URL,
        clientId: env.VITE_OIDC_CLIENT_ID
      })
    }
  };
});
