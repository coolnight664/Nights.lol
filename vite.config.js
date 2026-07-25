import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import discordAuthPlugin from './discord-auth-plugin.js'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/Nights.lol/' : '/',
  plugins: [react(), ...(mode === 'development' ? [discordAuthPlugin()] : [])],
  server: {
    port: 3000,
    open: true
  }
}))
