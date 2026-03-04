import { useState } from 'react'
import type { DesignSpec, ScreenDef } from '../types/design'
import { ScreenPreview } from './LivePreview'

interface Props {
  spec: DesignSpec
  screen: ScreenDef
  onNavigate: (screenId: string) => void
  onBack: () => void
}

export function ScreenDetailView({ spec, screen, onNavigate, onBack }: Props) {
  const [showCode, setShowCode] = useState(false)

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-900">
      {/* Main preview area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-800/80 border-b border-slate-700 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              画面フロー
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-white font-medium text-sm">{screen.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <code className="text-slate-400 text-xs bg-slate-700 px-2 py-1 rounded font-mono">
              {screen.route}
            </code>
          </div>
        </div>

        {/* Screen preview - scrollable */}
        <div className="flex-1 overflow-auto bg-slate-950 scrollbar-thin">
          <div className="min-h-full">
            <ScreenPreview
              screenCode={screen.code}
              components={spec.components}
              navigate={(id) => {
                const target = spec.screens.find(s => s.id === id)
                if (target) onNavigate(id)
              }}
            />
          </div>
        </div>
      </div>

      {/* Right sidebar - info panel */}
      <div className="w-72 bg-slate-800 border-l border-slate-700 flex flex-col overflow-y-auto scrollbar-thin shrink-0">
        <div className="p-5 space-y-6">
          {/* Screen info */}
          <div>
            <h2 className="text-white font-bold text-lg mb-1">{screen.name}</h2>
            <p className="text-slate-400 text-sm leading-relaxed">{screen.description}</p>
          </div>

          {/* Components used */}
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">使用コンポーネント</h3>
            <div className="space-y-2">
              {screen.components.map(name => {
                const comp = spec.components.find(c => c.name === name)
                return (
                  <div key={name} className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span className="text-slate-300 text-sm font-mono">{name}</span>
                    {comp && (
                      <span className="text-slate-500 text-xs ml-auto">{comp.category}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Connections */}
          {screen.connections.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">画面遷移</h3>
              <div className="space-y-2">
                {screen.connections.map(conn => {
                  const target = spec.screens.find(s => s.id === conn.to)
                  return (
                    <button
                      key={conn.to}
                      onClick={() => onNavigate(conn.to)}
                      className="w-full text-left bg-slate-700/50 hover:bg-slate-700 rounded-lg px-3 py-2 transition-colors group"
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <svg className="w-3 h-3 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        <span className="text-slate-200 text-sm group-hover:text-white transition-colors">
                          {target?.name ?? conn.to}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs pl-5">{conn.label}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Source code */}
          <div>
            <button
              onClick={() => setShowCode(!showCode)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors w-full"
            >
              <svg className={`w-3 h-3 transition-transform ${showCode ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              ソースコード
            </button>
            {showCode && (
              <pre className="mt-3 bg-slate-900 rounded-xl p-3 text-xs text-slate-300 overflow-x-auto scrollbar-thin font-mono leading-relaxed">
                {screen.code}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
