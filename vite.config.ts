import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'

export default defineConfig(({ mode }) => {
  // Load .env file (if present) for server-side use only
  const env = loadEnv(mode, process.cwd(), '')
  const envApiKey = env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || ''

  return {
    plugins: [
      react(),
      {
        name: 'anthropic-proxy',
        configureServer(server) {
          // Expose whether an API key is configured via env
          server.middlewares.use('/api/has-api-key', (_req: IncomingMessage, res: ServerResponse) => {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ hasApiKey: envApiKey.length > 0 }))
          })

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

                // env var takes priority; fall back to key sent from client
                const resolvedKey = envApiKey || apiKey
                if (!resolvedKey) {
                  res.statusCode = 401
                  res.end(JSON.stringify({ error: 'API key is required. Set ANTHROPIC_API_KEY in .env or enter it in the UI.' }))
                  return
                }

                const response = await fetch('https://api.anthropic.com/v1/messages', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': resolvedKey,
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
  }
})
