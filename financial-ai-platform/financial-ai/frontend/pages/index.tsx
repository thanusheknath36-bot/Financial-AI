'use client'
import { useState, useRef } from 'react'
import axios from 'axios'
import Head from 'next/head'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type Metrics = {
  revenue: number | null
  net_income: number | null
  total_assets: number | null
  total_debt: number | null
  shareholder_equity: number | null
  operating_cash_flow: number | null
}

type Ratios = {
  net_profit_margin: number | null
  roe: number | null
  debt_to_equity: number | null
  current_ratio: number | null
}

type Result = {
  company: string
  period: string
  health_score: number
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical'
  summary: string
  metrics: Metrics
  ratios: Ratios
  strengths: string[]
  weaknesses: string[]
  warnings: string[]
  recommendation: string
}

function fmt(n: number | null): string {
  if (n === null || n === undefined) return '—'
  if (Math.abs(n) >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B'
  if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(1) + 'M'
  if (Math.abs(n) >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K'
  return String(n)
}

function fmtPct(n: number | null): string {
  if (n === null || n === undefined) return '—'
  return (n * 100).toFixed(1) + '%'
}

function fmtNum(n: number | null): string {
  if (n === null || n === undefined) return '—'
  return n.toFixed(2)
}

function scoreColor(s: number) {
  if (s >= 75) return { bg: '#dcfce7', text: '#15803d' }
  if (s >= 50) return { bg: '#fef9c3', text: '#854d0e' }
  return { bg: '#fee2e2', text: '#b91c1c' }
}

function riskColor(r: string) {
  const map: Record<string, { bg: string; text: string }> = {
    Low: { bg: '#dcfce7', text: '#15803d' },
    Moderate: { bg: '#fef9c3', text: '#854d0e' },
    High: { bg: '#ffedd5', text: '#9a3412' },
    Critical: { bg: '#fee2e2', text: '#b91c1c' },
  }
  return map[r] || map['Moderate']
}

const STEPS = [
  'Reading document…',
  'Extracting financial statements…',
  'Identifying key metrics…',
  'Computing ratios…',
  'Running AI analysis…',
  'Finalizing report…',
]

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    setFile(f)
    setResult(null)
    setError('')
  }

  async function analyze() {
    if (!file) return
    setLoading(true)
    setStep(0)
    setError('')
    setResult(null)

    const iv = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 2500)

    try {
      const form = new FormData()
      form.append('file', file)
      const res = await axios.post(`${API}/analyze`, form)
      clearInterval(iv)
      setResult(res.data)
    } catch (e: any) {
      clearInterval(iv)
      setError(e?.response?.data?.detail || e.message || 'Analysis failed. Check your API key and backend.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setFile(null)
    setResult(null)
    setError('')
    setStep(0)
  }

  return (
    <>
      <Head>
        <title>FinanceAI — Report Analyzer</title>
        <meta name="description" content="AI-powered financial report analysis" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 text-sm font-bold">F</div>
              <span className="font-semibold text-gray-900">FinanceAI</span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Powered by Claude</span>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-10">

          {/* Upload */}
          {!result && !loading && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Report Analyzer</h1>
                <p className="text-gray-500">Upload any financial report and get instant CFA-level AI analysis</p>
              </div>

              <div
                className={`upload-zone mb-4 ${drag ? 'drag' : ''}`}
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
              >
                <div className="text-5xl mb-4">📄</div>
                <p className="text-lg font-medium text-gray-700 mb-1">Drop your financial report here</p>
                <p className="text-sm text-gray-400">PDF, TXT, CSV — annual reports, 10-K, balance sheets</p>
              </div>

              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.txt,.csv"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }}
              />

              {file && (
                <div className="flex items-center gap-2 mb-4 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 w-fit">
                  <span className="text-blue-600 text-sm">📎</span>
                  <span className="text-sm text-blue-800 font-medium">{file.name}</span>
                  <button onClick={() => setFile(null)} className="text-blue-400 hover:text-blue-700 ml-1 text-xs">✕</button>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={analyze}
                disabled={!file}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: file ? '#1d4ed8' : '#93c5fd' }}
              >
                🧠 Analyze with AI
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">Your file stays on your device — only text is sent for analysis</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-20">
              <div className="spinner" />
              <p className="font-medium text-gray-800 text-lg mb-2">{STEPS[step]}</p>
              <p className="text-sm text-gray-400">This takes 10–20 seconds</p>
              <div className="flex justify-center gap-1 mt-6">
                {STEPS.map((_, i) => (
                  <div key={i} className={`h-1 w-8 rounded-full transition-all ${i <= step ? 'bg-blue-500' : 'bg-gray-200'}`} />
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div>
              {/* Score card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 flex items-start gap-5">
                <div className="score-ring" style={scoreColor(result.health_score)}>
                  {result.health_score}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-900">{result.company}</h2>
                    <span className="text-sm text-gray-400">{result.period}</span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full" style={riskColor(result.risk_level)}>
                      {result.risk_level} Risk
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p>
                </div>
              </div>

              {/* Metrics */}
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Key Metrics</h3>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Revenue', val: fmt(result.metrics.revenue) },
                  { label: 'Net Income', val: fmt(result.metrics.net_income) },
                  { label: 'Total Assets', val: fmt(result.metrics.total_assets) },
                  { label: 'Total Debt', val: fmt(result.metrics.total_debt) },
                  { label: 'Equity', val: fmt(result.metrics.shareholder_equity) },
                  { label: 'Operating CF', val: fmt(result.metrics.operating_cash_flow) },
                ].map(m => (
                  <div key={m.label} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">{m.label}</p>
                    <p className="text-lg font-bold text-gray-900">{m.val}</p>
                  </div>
                ))}
              </div>

              {/* Ratios */}
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Financial Ratios</h3>
              <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Net Margin', val: fmtPct(result.ratios.net_profit_margin) },
                  { label: 'ROE', val: fmtPct(result.ratios.roe) },
                  { label: 'Debt/Equity', val: fmtNum(result.ratios.debt_to_equity) },
                  { label: 'Current Ratio', val: fmtNum(result.ratios.current_ratio) },
                ].map(r => (
                  <div key={r.label} className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-blue-400 mb-1">{r.label}</p>
                    <p className="text-lg font-bold text-blue-800">{r.val}</p>
                  </div>
                ))}
              </div>

              {/* Strengths */}
              {result.strengths?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Strengths</h3>
                  <div className="flex flex-col gap-2">
                    {result.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-800">
                        <span className="mt-0.5">✓</span>{s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weaknesses */}
              {result.weaknesses?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Weaknesses</h3>
                  <div className="flex flex-col gap-2">
                    {result.weaknesses.map((w, i) => (
                      <div key={i} className="flex items-start gap-3 bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3 text-sm text-yellow-800">
                        <span className="mt-0.5">⚠</span>{w}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {result.warnings?.filter(Boolean).length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Warnings</h3>
                  <div className="flex flex-col gap-2">
                    {result.warnings.filter(Boolean).map((w, i) => (
                      <div key={i} className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-800">
                        <span className="mt-0.5">⛔</span>{w}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendation */}
              <div className="bg-blue-600 rounded-2xl p-5 mb-6">
                <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-2">Recommendation</p>
                <p className="text-white text-sm leading-relaxed">{result.recommendation}</p>
              </div>

              <button onClick={reset} className="w-full py-3 rounded-xl border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-all">
                ↩ Analyze another report
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
