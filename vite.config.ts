import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'anthropic-proxy',
      configureServer(server) {
        server.middlewares.use('/api/claude', (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end('Method Not Allowed')
            return
          }

          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk.toString() })
          req.on('end', async () => {
            try {
              const { apiKey, system, messages, model = 'claude-sonnet-4-6', maxTokens = 8000 } = JSON.parse(body)

              const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-api-key': apiKey,
                  'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                  model,
                  max_tokens: maxTokens,
                  system,
                  messages,
                }),
              })

              const data = await response.json()
              res.setHeader('Content-Type', 'application/json')
              res.statusCode = response.status
              res.end(JSON.stringify(data))
            } catch (e: unknown) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }))
            }
          })
        })
      },
    },
  ],
})
