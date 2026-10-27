import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En local el gateway está en este PC; en Docker se pasa su nombre en la red (docker-compose.yml).
// preview usa el mismo proxy que dev.
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:8080'

// El stream de notificaciones (SSE) va directo a booking-reservation, no por el gateway: igual
// que en nginx, Spring Cloud Gateway Server WebMVC puede bufferear una respuesta que no termina.
const BOOKING_URL = process.env.BOOKING_URL || 'http://localhost:3003'

// Sin el header Origin, para el gateway es una llamada de servidor a servidor: no aplica CORS
// (así también funciona abriendo la app por un túnel con otro dominio)
function stripOrigin(proxy) {
  proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'))
}

// https://vite.dev/config/
/* global process */
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
    // El navegador llama a /api en su mismo origen y Vite lo reenvía desde este PC
    proxy: {
      '/api/notifications/stream': {
        target: BOOKING_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: stripOrigin,
      },
      '/api': {
        target: GATEWAY_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: stripOrigin,
      },
    },
  },
})
