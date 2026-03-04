import { useLayoutEffect, useRef, useState } from 'react'
import type { DesignSpec, ScreenDef } from '../types/design'
import { ScreenPreview } from './LivePreview'

const THUMB_W = 240
const THUMB_H = 160
const SCALE = 0.2
const CARD_W = THUMB_W + 0    // card is same as thumb width
const CARD_PADDING = 32        // gap between cards

interface Arrow {
  x1: number
  y1: number
  x2: number
  y2: number
  label: string
}

interface Props {
  spec: DesignSpec
  onSelectScreen: (screen: ScreenDef) => void
}

export function ScreenFlowView({ spec, onSelectScreen }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [arrows, setArrows] = useState<Arrow[]>([])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const newArrows: Arrow[] = []

    spec.screens.forEach(screen => {
      const fromEl = cardRefs.current[screen.id]
      if (!fromEl) return

      screen.connections.forEach(conn => {
        const toEl = cardRefs.current[conn.to]
        if (!toEl) return

        const fromRect = fromEl.getBoundingClientRect()
        const toRect = toEl.getBoundingClientRect()

        // Arrow from right-center of source to left-center of target
        // But if target is below, arrow from bottom-center to top-center
        const fromCX = fromRect.left + fromRect.width / 2 - containerRect.left
        const fromCY = fromRect.top + fromRect.height / 2 - containerRect.top
        const toCX = toRect.left + toRect.width / 2 - containerRect.left
        const toCY = toRect.top + toRect.height / 2 - containerRect.top

        let x1, y1, x2, y2

        // Determine connection direction
        const sameRow = Math.abs(fromCY - toCY) < fromRect.height / 2
        if (sameRow) {
          // Horizontal connection
          x1 = fromRect.right - containerRect.left
          y1 = fromCY
          x2 = toRect.left - containerRect.left
          y2 = toCY
        } else if (toCY > fromCY) {
          // Target is below
          x1 = fromCX
          y1 = fromRect.bottom - containerRect.top
          x2 = toCX
          y2 = toRect.top - containerRect.top
        } else {
          // Target is above
          x1 = fromCX
          y1 = fromRect.top - containerRect.top
          x2 = toCX
          y2 = toRect.bottom - containerRect.top
        }

        newArrows.push({ x1, y1, x2, y2, label: conn.label })
      })
    })

    setArrows(newArrows)
  }, [spec])

  // Re-compute on window resize
  useLayoutEffect(() => {
    const handleResize = () => {
      // Trigger re-render to recalculate
      setArrows([])
      setTimeout(() => {
        const container = containerRef.current
        if (!container) return
        const containerRect = container.getBoundingClientRect()
        const newArrows: Arrow[] = []

        spec.screens.forEach(screen => {
          const fromEl = cardRefs.current[screen.id]
          if (!fromEl) return
          screen.connections.forEach(conn => {
            const toEl = cardRefs.current[conn.to]
            if (!toEl) return

            const fromRect = fromEl.getBoundingClientRect()
            const toRect = toEl.getBoundingClientRect()
            const fromCX = fromRect.left + fromRect.width / 2 - containerRect.left
            const fromCY = fromRect.top + fromRect.height / 2 - containerRect.top
            const toCX = toRect.left + toRect.width / 2 - containerRect.left
            const toCY = toRect.top + toRect.height / 2 - containerRect.top

            let x1, y1, x2, y2
            const sameRow = Math.abs(fromCY - toCY) < fromRect.height / 2
            if (sameRow) {
              x1 = fromRect.right - containerRect.left; y1 = fromCY
              x2 = toRect.left - containerRect.left; y2 = toCY
            } else if (toCY > fromCY) {
              x1 = fromCX; y1 = fromRect.bottom - containerRect.top
              x2 = toCX; y2 = toRect.top - containerRect.top
            } else {
              x1 = fromCX; y1 = fromRect.top - containerRect.top
              x2 = toCX; y2 = toRect.bottom - containerRect.top
            }

            newArrows.push({ x1, y1, x2, y2, label: conn.label })
          })
        })
        setArrows(newArrows)
      }, 50)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [spec])

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 scrollbar-thin">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">画面フロー</h1>
          <p className="text-slate-400 text-sm">
            {spec.screens.length}画面 — サムネイルをクリックすると画面が開きます
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-6 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 bg-indigo-500" />
            <span>画面遷移</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border border-indigo-400 bg-indigo-500/20" />
            <span>クリックで詳細表示</span>
          </div>
        </div>

        {/* Flow canvas */}
        <div ref={containerRef} className="relative">
          {/* SVG arrows overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0, minHeight: '100%' }}
          >
            <defs>
              {arrows.map((_, i) => (
                <marker
                  key={i}
                  id={`arrow-${i}`}
                  markerWidth="8"
                  markerHeight="8"
                  refX="6"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L0,6 L8,3 z" fill="#6366f1" opacity="0.8" />
                </marker>
              ))}
            </defs>
            {arrows.map((a, i) => {
              const cx = (a.x1 + a.x2) / 2
              const cy = (a.y1 + a.y2) / 2
              const dx = a.x2 - a.x1
              const dy = a.y2 - a.y1
              const isHorizontal = Math.abs(dx) > Math.abs(dy)
              const cp1x = isHorizontal ? a.x1 + dx * 0.4 : a.x1
              const cp1y = isHorizontal ? a.y1 : a.y1 + dy * 0.4
              const cp2x = isHorizontal ? a.x2 - dx * 0.4 : a.x2
              const cp2y = isHorizontal ? a.y2 : a.y2 - dy * 0.4

              return (
                <g key={i}>
                  <path
                    d={`M ${a.x1} ${a.y1} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${a.x2} ${a.y2}`}
                    stroke="#6366f1"
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.6"
                    markerEnd={`url(#arrow-${i})`}
                  />
                  {/* Label */}
                  <text
                    x={cx}
                    y={cy - 6}
                    textAnchor="middle"
                    fill="#a5b4fc"
                    fontSize="10"
                    fontFamily="system-ui, sans-serif"
                    className="pointer-events-none"
                  >
                    {a.label.length > 20 ? a.label.slice(0, 20) + '…' : a.label}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Screen cards grid */}
          <div
            className="flex flex-wrap relative"
            style={{ gap: CARD_PADDING, zIndex: 1, padding: 20 }}
          >
            {spec.screens.map(screen => (
              <div
                key={screen.id}
                ref={el => { cardRefs.current[screen.id] = el }}
                onClick={() => onSelectScreen(screen)}
                className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 cursor-pointer group"
                style={{ width: CARD_W, flexShrink: 0 }}
              >
                {/* Thumbnail */}
                <div
                  className="relative overflow-hidden bg-slate-900 group-hover:opacity-90 transition-opacity"
                  style={{ width: THUMB_W, height: THUMB_H }}
                >
                  <ScreenPreview
                    screenCode={screen.code}
                    components={spec.components}
                    scale={SCALE}
                    containerWidth={THUMB_W}
                    containerHeight={THUMB_H}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-full">
                      開く →
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="text-white font-semibold text-sm">{screen.name}</h3>
                    <code className="text-slate-500 text-xs font-mono">{screen.route}</code>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{screen.description}</p>

                  {/* Connections */}
                  {screen.connections.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {screen.connections.map(conn => {
                        const target = spec.screens.find(s => s.id === conn.to)
                        return (
                          <span key={conn.to} className="text-xs px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">
                            → {target?.name ?? conn.to}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
