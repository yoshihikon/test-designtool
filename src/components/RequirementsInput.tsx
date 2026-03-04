import React, { useState } from 'react'

interface Props {
  onGenerate: (requirements: string, apiKey: string) => void
  error?: string | null
}

const EXAMPLES = [
  {
    label: 'ECサイト',
    text: `ECサイトのデザインシステムを作成してください。
機能: 商品一覧、商品詳細、カート、チェックアウト、注文完了、ユーザープロフィール
ターゲット: 一般消費者、モバイルフレンドリー
ブランド: モダンでクリーンなデザイン、信頼感のある配色`,
  },
  {
    label: 'SaaS管理画面',
    text: `SaaSプロダクトの管理ダッシュボードを作成してください。
機能: KPIダッシュボード、ユーザー管理、プラン・課金管理、設定画面、レポート
ターゲット: BtoBのビジネスユーザー
デザイン: プロフェッショナル、データビジュアライゼーション重視`,
  },
  {
    label: 'タスク管理アプリ',
    text: `チームのタスク管理アプリを設計してください。
機能: タスク一覧、タスク詳細・編集、プロジェクト管理、チームメンバー管理、通知
操作: ドラッグ&ドロップでの並び替え、フィルタリング、検索
デザイン: シンプルで直感的、生産性向上に焦点`,
  },
]

export function RequirementsInput({ onGenerate, error }: Props) {
  const [requirements, setRequirements] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!requirements.trim() || !apiKey.trim()) return
    onGenerate(requirements, apiKey)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">AI Design Tool</h1>
          <p className="text-slate-400 text-lg">要件を入力するだけで、デザインシステムと画面フローを自動生成</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* API Key */}
          <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-5">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Anthropic API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-12 font-mono text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showKey ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">APIキーはサーバーに保存されません。リクエスト時のみ使用されます。</p>
          </div>

          {/* Requirements */}
          <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-2xl p-5">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              プロダクト要件
            </label>
            <textarea
              value={requirements}
              onChange={e => setRequirements(e.target.value)}
              placeholder="作りたいプロダクトの概要を記述してください。&#10;例：ECサイト、管理画面、アプリの機能、ターゲットユーザー、デザインの方向性など"
              className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[160px] resize-y text-sm leading-relaxed"
              required
            />

            {/* Example buttons */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-slate-500 self-center">例:</span>
              {EXAMPLES.map(ex => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => setRequirements(ex.text)}
                  className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
              <strong>エラー:</strong> {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!requirements.trim() || !apiKey.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            デザインを生成する
          </button>
        </form>

        {/* Feature list */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '🧩', text: 'コンポーネント定義' },
            { icon: '🎨', text: 'デザインシステム' },
            { icon: '🗺️', text: '画面フロー' },
          ].map(f => (
            <div key={f.text} className="bg-slate-800/40 rounded-xl p-4">
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-xs text-slate-400">{f.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
