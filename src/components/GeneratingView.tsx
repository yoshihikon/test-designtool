import { useEffect, useState } from 'react'

const MESSAGES = [
  '要件を解析しています...',
  '機能から画面の種類を特定しています...',
  'UIコンポーネントを設計しています...',
  'Reactコンポーネントを定義しています...',
  'カラーパレットを最適化しています...',
  '画面レイアウトを生成しています...',
  'ユーザーフローを確立しています...',
  'デザインシステムを完成させています...',
]

export function GeneratingView() {
  const [msgIdx, setMsgIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(i => (i + 1) % MESSAGES.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center">
      <div className="text-center max-w-sm">
        {/* Animated icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-spin-slow" />
          <div className="absolute inset-2 rounded-full border-4 border-t-indigo-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" style={{ animationDuration: '1s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">AIがデザインを生成中</h2>

        <div className="h-8 flex items-center justify-center">
          <p
            key={msgIdx}
            className="text-indigo-300 text-sm animate-pulse"
          >
            {MESSAGES[msgIdx]}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {MESSAGES.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                i === msgIdx ? 'bg-indigo-400 scale-125' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>

        <p className="text-slate-500 text-xs mt-6">
          コンポーネント定義と画面レイアウトを生成しています
        </p>
      </div>
    </div>
  )
}
