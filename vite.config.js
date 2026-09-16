import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    proxy: {
      '/api/v1/auth': {
        target: 'http://localhost:8086',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res.headersSent) return;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                message: 'Live simulation mode active. Backend service on port 8086 offline.',
                status: 'SIMULATED',
              })
            );
          });
        },
      },
      '/api/v1/applications': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res.headersSent) return;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify([]));
          });
        },
      },
      '/api/v1/analytics': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res.headersSent) return;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                message: 'Analytics service simulation mode active.',
                status: 'SIMULATED',
              })
            );
          });
        },
      },
      '/api/v1/anomalies': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res.headersSent) return;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                message: 'Anomaly service simulation mode active.',
                status: 'SIMULATED',
              })
            );
          });
        },
      },
      '/api/v1/ai': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res.headersSent) return;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                message: 'AI service simulation mode active.',
                status: 'SIMULATED',
              })
            );
          });
        },
      },
      '/api/v1/ml': {
        target: 'http://localhost:8087',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res.headersSent) return;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                message: 'ML service simulation mode active.',
                status: 'SIMULATED',
              })
            );
          });
        },
      },
      '/api/v1/nlp': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res.headersSent) return;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                message: 'NLP service simulation mode active.',
                status: 'SIMULATED',
              })
            );
          });
        },
      },
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            if (res.headersSent) return;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'OK' }));
          });
        },
      },
    },

    watch: {
      ignored: [
        '**/*.zip',
        '**/microservices/**/target/**',
        '**/.git/**',
      ],
    },
  },
})