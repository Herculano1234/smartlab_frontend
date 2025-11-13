import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Definir porta explicitamente. Desativamos HMR websocket para ambientes onde
    // o cliente tenta abrir conexões ws que não são desejadas (ex: remote/containers).
    port: 5173,
    host: true,
    // Desativar HMR WebSocket (usará polling/fallbacks do Vite internamente) — evita erros de WebSocket
    hmr: false,
    proxy: {
      '/hospitais': 'http://localhost:4000',
      // Adicione outros endpoints se necessário
    },
  },
});
