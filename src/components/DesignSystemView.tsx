import { useState } from 'react'
import type { DesignSpec, ComponentDef } from '../types/design'
import { ComponentPreview } from './LivePreview'

const CATEGORY_LABELS: Record<string, string> = {
  layout: 'レイアウト',
  input: '入力',
  display: '表示',
  navigation: 'ナビゲーション',
  feedback: 'フィードバック',
}

const CATEGORY_COLORS: Record<string, string> = {
  layout: 'bg-blue-500/20 text-blue-300',
  input: 'bg-green-500/20 text-green-300',
  display: 'bg-purple-500/20 text-purple-300',
  navigation: 'bg-orange-500/20 text-orange-300',
  feedback: 'bg-pink-500/20 text-pink-300',
}

function ColorSwatch({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="w-10 h-10 rounded-xl shadow-inner border border-white/10" style={{ backgroundColor: color }} />
      <div className="text-center">
        <div className="text-xs text-slate-300 font-medium">{label}</div>
        <div className="text-xs text-slate-500 font-mono">{color}</div>
      </div>
    </div>
  )
}

function ComponentCard({ component }: { component: ComponentDef }) {
  const [showCode, setShowCode] = useState(false)

  return (
    <div className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 hover:border-slate-500 transition-colors">
      {/* Preview area */}
      <div className="bg-white rounded-t-2xl" style={{ minHeight: 120, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="w-full">
          <ComponentPreview component={component} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="text-white font-semibold text-sm">{component.name}</h3>
            <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{component.description}</p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${CATEGORY_COLORS[component.category] ?? 'bg-slate-600 text-slate-300'}`}>
            {CATEGORY_LABELS[component.category] ?? component.category}
          </span>
        </div>

        {/* Props */}
        {component.props.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {component.props.map(p => (
                <span key={p.name} className="text-xs px-2 py-0.5 bg-slate-700 text-slate-400 rounded font-mono">
                  {p.name}
                  {p.required && <span className="text-red-400 ml-0.5">*</span>}
                  <span className="text-slate-500">: {p.type}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Code toggle */}
        <button
          onClick={() => setShowCode(!showCode)}
          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
        >
          <svg className={`w-3 h-3 transition-transform ${showCode ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {showCode ? 'コードを隠す' : 'コードを表示'}
        </button>

        {showCode && (
          <pre className="mt-2 bg-slate-900 rounded-xl p-3 text-xs text-slate-300 overflow-x-auto scrollbar-thin font-mono leading-relaxed">
            {component.code}
          </pre>
        )}
      </div>
    </div>
  )
}

interface Props {
  spec: DesignSpec
}

export function DesignSystemView({ spec }: Props) {
  const [filter, setFilter] = useState<string>('all')

  const categories = ['all', ...Array.from(new Set(spec.components.map(c => c.category)))]

  const filtered = filter === 'all'
    ? spec.components
    : spec.components.filter(c => c.category === filter)

  return (
    <div className="flex-1 overflow-y-auto bg-slate-900 scrollbar-thin">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">デザインシステム</h1>
          <p className="text-slate-400 text-sm">{spec.components.length}個のコンポーネントが定義されています</p>
        </div>

        {/* Color Palette */}
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">カラーパレット</h2>
          <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
            <div className="flex flex-wrap gap-6">
              {Object.entries(spec.palette).map(([key, value]) => (
                <ColorSwatch key={key} label={key} color={value} />
              ))}
            </div>
          </div>
        </section>

        {/* Component Filter */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'すべて' : (CATEGORY_LABELS[cat] ?? cat)}
              <span className="ml-1.5 text-xs opacity-70">
                {cat === 'all' ? spec.components.length : spec.components.filter(c => c.category === cat).length}
              </span>
            </button>
          ))}
        </div>

        {/* Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(component => (
            <ComponentCard key={component.name} component={component} />
          ))}
        </div>
      </div>
    </div>
  )
}
