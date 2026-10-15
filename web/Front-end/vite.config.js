import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En local el gateway y el mock están en este PC; en Docker se pasan sus nombres en la red
// (docker-compose.yml). preview usa el mismo proxy que dev.
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080'
const MOCK_URL = process.env.MOCK_URL || 'http://localhost:3100'

// Sin el header Origin, para el gateway es una llamada de servidor a servidor: no aplica CORS
// (así también funciona abriendo la app por un túnel con otro dominio)
function stripOrigin(proxy) {
  proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'))
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['react-native']
  },
  preview: {
    // Sin esto, vite preview rechaza con 403 cualquier Host que no sea localhost (protección
    // propia de Vite contra DNS rebinding) -- necesario porque nginx reenvía con Host: rentamovil.tech.
    allowedHosts: ['rentamovil.tech', 'www.rentamovil.tech'],
  },
  server: {
    // El navegador llama a /api y /mock en su mismo origen y Vite lo reenvía desde este PC
    proxy: {
      '/api': {
        target: GATEWAY_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: stripOrigin,
      },
      '/mock': {
        target: MOCK_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mock/, ''),
        configure: stripOrigin,
      },
    },
  },
})
