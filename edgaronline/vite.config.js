import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@context': path.resolve(__dirname, './src/context'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    host: '0.0.0.0', // Allow connections from any IP address
    port: 3000,
    https: {
      key: fs.readFileSync('/home/ec2-user/poc/ssl/localhost.key'),
      cert: fs.readFileSync('/home/ec2-user/poc/ssl/localhost.crt')
    },
    proxy: {
      '/api': {
        target: 'https://localhost:3001',  // Changed to HTTPS
        changeOrigin: true,
        secure: false,  // Accept self-signed certificates
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Get the real client IP
            const clientIp = req.socket.remoteAddress || req.connection.remoteAddress;
            
            // Set X-Forwarded-For header to preserve the original client IP
            const existingForwarded = req.headers['x-forwarded-for'];
            if (existingForwarded) {
              proxyReq.setHeader('x-forwarded-for', `${existingForwarded}, ${clientIp}`);
            } else {
              proxyReq.setHeader('x-forwarded-for', clientIp);
            }
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});


