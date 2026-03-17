import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/v1': 'http://localhost:8000',
            '/verify': 'http://localhost:8000',
            '/goals': 'http://localhost:8000',
            '/goal': 'http://localhost:8000',
            '/ledger': 'http://localhost:8000',
            '/explain': 'http://localhost:8000',
            '/governance': 'http://localhost:8000',
            '/kpis': 'http://localhost:8000',
            '/metrics': 'http://localhost:8000',
            '/ingest': 'http://localhost:8000',
            '/datasets': 'http://localhost:8000'
        }
    }
})
