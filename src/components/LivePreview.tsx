import React, { Component, useEffect, useState } from 'react'
import { compileComponent, compileScreen } from '../lib/codeRunner'
import type { ComponentDef } from '../types/design'

// Error boundary for safe rendering of dynamic components
class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: string }
> {
  state = { hasError: false, error: '' }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex items-center justify-center h-full text-center p-4">
            <div>
              <div className="text-red-400 text-xs font-mono mb-1">Render Error</div>
              <div className="text-slate-500 text-xs">{this.state.error}</div>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}

// --- Component Preview ---

interface ComponentPreviewProps {
  component: ComponentDef
}

export function ComponentPreview({ component }: ComponentPreviewProps) {
  const [Comp, setComp] = useState<React.ComponentType<Record<string, unknown>> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const compiled = compileComponent(component.code, component.name)
      setComp(() => compiled)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setComp(null)
    }
  }, [component.code, component.name])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-center p-3">
        <div>
          <div className="text-red-400 text-xs font-mono mb-1">Compile Error</div>
          <div className="text-slate-500 text-xs">{error}</div>
        </div>
      </div>
    )
  }

  if (!Comp) {
    return <div className="animate-pulse bg-slate-700 rounded h-full" />
  }

  return (
    <ErrorBoundary>
      <Comp {...(component.previewProps as Record<string, unknown>)} />
    </ErrorBoundary>
  )
}

// --- Screen Preview (full or thumbnail) ---

interface ScreenPreviewProps {
  screenCode: string
  components: ComponentDef[]
  navigate?: (id: string) => void
  scale?: number // CSS scale factor for thumbnail (e.g. 0.2)
  containerWidth?: number
  containerHeight?: number
}

export function ScreenPreview({
  screenCode,
  components,
  navigate,
  scale,
  containerWidth = 240,
  containerHeight = 160,
}: ScreenPreviewProps) {
  const [Screen, setScreen] = useState<React.ComponentType<Record<string, unknown>> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const compiled = compileScreen(
        components.map(c => c.code),
        screenCode
      )
      setScreen(() => compiled)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setScreen(null)
    }
  }, [screenCode, components])

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-slate-800 text-center p-2">
        <div>
          <div className="text-red-400 text-xs mb-1">Error</div>
          <div className="text-slate-500" style={{ fontSize: '10px' }}>{error.slice(0, 80)}</div>
        </div>
      </div>
    )
  }

  if (!Screen) {
    return <div className="animate-pulse bg-slate-800 w-full h-full rounded" />
  }

  // Thumbnail mode: scale the rendered screen down
  if (scale !== undefined) {
    const innerWidth = containerWidth / scale
    const innerHeight = containerHeight / scale

    return (
      <div
        style={{ width: containerWidth, height: containerHeight, overflow: 'hidden', position: 'relative' }}
      >
        <div
          style={{
            width: innerWidth,
            height: innerHeight,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          <ErrorBoundary
            fallback={
              <div
                className="bg-slate-800 flex items-center justify-center text-slate-500 text-xs"
                style={{ width: innerWidth, height: innerHeight }}
              >
                Preview error
              </div>
            }
          >
            <Screen navigate={navigate ?? (() => {})} />
          </ErrorBoundary>
        </div>
      </div>
    )
  }

  // Full mode
  return (
    <ErrorBoundary>
      <Screen navigate={navigate ?? (() => {})} />
    </ErrorBoundary>
  )
}
