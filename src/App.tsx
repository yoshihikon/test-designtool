import { useState } from 'react'
import type { DesignSpec, Phase, ViewState, ScreenDef } from './types/design'
import { generateDesignSpec } from './lib/api'
import { RequirementsInput } from './components/RequirementsInput'
import { GeneratingView } from './components/GeneratingView'
import { DesignSystemView } from './components/DesignSystemView'
import { ScreenFlowView } from './components/ScreenFlowView'
import { ScreenDetailView } from './components/ScreenDetailView'

export default function App() {
  const [phase, setPhase] = useState<Phase>('input')
  const [spec, setSpec] = useState<DesignSpec | null>(null)
  const [view, setView] = useState<ViewState>({ type: 'design-system' })
  const [error, setError] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleGenerate = async (requirements: string) => {
    setError(null)
    setPhase('generating')
    try {
      const result = await generateDesignSpec(requirements)
      setSpec(result)
      setView({ type: 'screen-flow' })
      setPhase('ready')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setPhase('input')
    }
  }

  const handleSelectScreen = (screen: ScreenDef) => {
    setView({ type: 'screen', id: screen.id })
  }

  const handleNavigateScreen = (screenId: string) => {
    setView({ type: 'screen', id: screenId })
  }

  if (phase === 'input') {
    return <RequirementsInput onGenerate={handleGenerate} error={error} />
  }

  if (phase === 'generating') {
    return <GeneratingView />
  }

  // phase === 'ready'
  if (!spec) return null

  const currentScreen = view.type === 'screen'
    ? spec.screens.find(s => s.id === view.id) ?? null
    : null

  return (
    <div className="h-screen flex bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-slate-950 border-r border-slate-800 flex flex-col transition-all duration-200 shrink-0 ${
          sidebarCollapsed ? 'w-14' : 'w-60'
        }`}
      >
        {/* Logo / Project name */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-white text-sm font-semibold truncate">{spec.projectName}</div>
                <div className="text-slate-500 text-xs truncate">{spec.tagline}</div>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center mx-auto">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-slate-500 hover:text-slate-300 transition-colors ml-auto"
          >
            <svg className={`w-4 h-4 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3">
          {/* Design System */}
          <NavItem
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            }
            label={`デザインシステム (${spec.components.length})`}
            active={view.type === 'design-system'}
            collapsed={sidebarCollapsed}
            onClick={() => setView({ type: 'design-system' })}
          />

          {/* Screen Flow */}
          <NavItem
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
            label={`画面フロー (${spec.screens.length})`}
            active={view.type === 'screen-flow'}
            collapsed={sidebarCollapsed}
            onClick={() => setView({ type: 'screen-flow' })}
          />

          {/* Screen list */}
          {!sidebarCollapsed && (
            <div className="mt-2">
              <div className="px-4 py-1.5 text-xs font-semibold text-slate-600 uppercase tracking-widest">
                画面
              </div>
              {spec.screens.map(screen => (
                <button
                  key={screen.id}
                  onClick={() => setView({ type: 'screen', id: screen.id })}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                    view.type === 'screen' && view.id === screen.id
                      ? 'text-indigo-300 bg-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{screen.name}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Bottom: New project */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => {
              setPhase('input')
              setSpec(null)
              setError(null)
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors text-sm ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title="新しいプロジェクト"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {!sidebarCollapsed && <span>新しいプロジェクト</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {view.type === 'design-system' && (
          <DesignSystemView spec={spec} />
        )}
        {view.type === 'screen-flow' && (
          <ScreenFlowView
            spec={spec}
            onSelectScreen={handleSelectScreen}
          />
        )}
        {view.type === 'screen' && currentScreen && (
          <ScreenDetailView
            spec={spec}
            screen={currentScreen}
            onNavigate={handleNavigateScreen}
            onBack={() => setView({ type: 'screen-flow' })}
          />
        )}
      </main>
    </div>
  )
}

// --- Sidebar nav item ---
interface NavItemProps {
  icon: React.ReactNode
  label: string
  active: boolean
  collapsed: boolean
  onClick: () => void
}

function NavItem({ icon, label, active, collapsed, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
        active
          ? 'text-indigo-300 bg-indigo-500/10 border-r-2 border-indigo-500'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      } ${collapsed ? 'justify-center' : ''}`}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </button>
  )
}
