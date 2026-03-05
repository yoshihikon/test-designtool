import type { DesignSpec } from '../types/design'

const SYSTEM_PROMPT = `You are an expert product designer and React developer. Given product requirements, generate a complete design system specification.

OUTPUT: Respond with ONLY a valid JSON object wrapped in a \`\`\`json code block. No explanation before or after.

JSON SCHEMA:
{
  "projectName": "string",
  "tagline": "string - one-line description",
  "palette": {
    "primary": "#hexcolor",
    "primaryText": "#hexcolor (text on primary bg)",
    "secondary": "#hexcolor",
    "background": "#hexcolor",
    "surface": "#hexcolor (card/panel bg)",
    "text": "#hexcolor",
    "textMuted": "#hexcolor",
    "border": "#hexcolor"
  },
  "components": [
    {
      "name": "ComponentName",
      "category": "layout|input|display|navigation|feedback",
      "description": "Brief description",
      "props": [
        { "name": "label", "type": "string", "required": false, "default": "Click me" }
      ],
      "previewProps": { "label": "Example Value" },
      "code": "function ComponentName({ prop1 = 'default', prop2 }) {\\n  return <div>...</div>;\\n}"
    }
  ],
  "screens": [
    {
      "id": "unique-kebab-id",
      "name": "Screen Name",
      "description": "What this screen does",
      "route": "/path",
      "components": ["ComponentName1", "ComponentName2"],
      "code": "function Screen({ navigate }) {\\n  return <div>...</div>;\\n}",
      "connections": [
        { "to": "other-screen-id", "label": "Action that triggers navigation" }
      ]
    }
  ]
}

CRITICAL RULES FOR COMPONENT CODE:
1. Function name must exactly match the "name" field
2. NO import statements - React, useState, useEffect, useRef, useCallback are globally available
3. Use Tailwind CSS utility classes for ALL styling
4. Make components interactive and realistic with proper event handlers
5. Use inline styles ONLY for dynamic values (colors from props, etc.)
6. Components must be self-contained

CRITICAL RULES FOR SCREEN CODE:
1. Function must always be named "Screen" (exactly)
2. Receives props: { navigate: (screenId: string) => void }
3. All component functions from the components array are available in scope by their name
4. Use realistic mock data (real names, prices, dates - never Lorem Ipsum)
5. Screen should fill its container with min-h-screen or explicit height
6. Call navigate('screen-id') to show navigation intent

QUALITY REQUIREMENTS:
- Generate 7-10 reusable, professionally designed components
- Generate 4-6 screens covering the main user journey
- Components should use Tailwind classes that result in polished, modern UI
- Do NOT use external libraries (no chart.js, no icons libraries, etc.)
- For icons, use simple SVG inline or Unicode symbols
- Colors should use Tailwind classes, not the palette values (palette is for documentation)
- Make screens look complete and production-ready with realistic content`

export async function generateDesignSpec(
  requirements: string
): Promise<DesignSpec> {
  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      maxTokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `以下の要件に基づいてデザインシステムを生成してください:\n\n${requirements}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error?.message || err.error || `HTTP ${response.status}`)
  }

  const data = await response.json()

  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error))
  }

  const text: string = data.content?.[0]?.text ?? ''

  // Extract JSON from markdown code block
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
  const jsonText = jsonMatch ? jsonMatch[1] : text.trim()

  try {
    return JSON.parse(jsonText) as DesignSpec
  } catch {
    throw new Error('AIのレスポンスのパースに失敗しました。もう一度お試しください。')
  }
}
