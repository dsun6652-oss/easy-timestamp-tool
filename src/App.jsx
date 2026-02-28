import { useState, useCallback, useEffect } from 'react'
import './App.css'

// 时间戳 → 北京时间（固定 UTC+8）
function timestampToBeijing(ts, isMs = true) {
  const ms = isMs ? Number(ts) : Number(ts) * 1000
  if (isNaN(ms) || ms < 0) return null
  const d = new Date(ms)
  if (isNaN(d.getTime())) return null
  return d.toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' })
}

// 日期时间 → 时间戳（按北京时间解析）
function dateToTimestamp(str, outputMs = true) {
  if (!str || !str.trim()) return null
  const s = str.trim()
  let dateStr = s
  const match = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/)
  if (match && !/[+-]\d{2}:?\d{2}$|[Zz]$/.test(s)) {
    const [, y, m, d, h = 0, min = 0, sec = 0] = match
    const pad = (n) => String(n).padStart(2, '0')
    dateStr = `${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(min)}:${pad(sec)}+08:00`
  }
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return null
  const ts = date.getTime()
  return outputMs ? ts : Math.floor(ts / 1000)
}

function App() {
  const [mode, setMode] = useState('ts2date') // 'ts2date' | 'date2ts'
  const [unit, setUnit] = useState('ms') // 'ms' | 's'
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const convert = useCallback(() => {
    setError('')
    setOutput('')
    if (!input.trim()) return

    if (mode === 'ts2date') {
      const result = timestampToBeijing(input.trim(), unit === 'ms')
      if (result) {
        setOutput(result)
      } else {
        setError('无效的时间戳，请检查格式')
      }
    } else {
      const result = dateToTimestamp(input.trim(), unit === 'ms')
      if (result !== null) {
        setOutput(String(result))
      } else {
        setError('无法解析日期时间，请使用格式：YYYY-MM-DD HH:mm:ss')
      }
    }
  }, [mode, unit, input])

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      setError('')
      return
    }
    convert()
  }, [input, mode, unit])

  const copyToClipboard = useCallback(async () => {
    const text = output || input
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('复制失败')
    }
  }, [output, input])

  const clearAll = useCallback(() => {
    setInput('')
    setOutput('')
    setError('')
  }, [])

  const setNow = useCallback(() => {
    const now = unit === 'ms' ? Date.now() : Math.floor(Date.now() / 1000)
    setInput(String(now))
  }, [unit])

  const copyTarget = output || input

  return (
    <div className="app">
      <header className="header">
        <h1>时间戳转换</h1>
        <p className="subtitle">时间戳 ⇄ 北京时间，支持秒/毫秒，一键复制</p>
      </header>

      <div className="toolbar">
        <div className="toolbar-left">
          <button
            onClick={() => setMode('ts2date')}
            className={`btn ${mode === 'ts2date' ? 'btn-primary' : 'btn-secondary'}`}
          >
            时间戳 → 北京时间
          </button>
          <button
            onClick={() => setMode('date2ts')}
            className={`btn ${mode === 'date2ts' ? 'btn-primary' : 'btn-secondary'}`}
          >
            日期时间 → 时间戳
          </button>
          <label className="unit-control">
            <span>单位</span>
            <select value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="ms">毫秒</option>
              <option value="s">秒</option>
            </select>
          </label>
          {mode === 'ts2date' && (
            <button onClick={setNow} className="btn btn-secondary">
              当前时间
            </button>
          )}
        </div>
        <div className="toolbar-right">
          <button
            onClick={copyToClipboard}
            className="btn btn-ghost"
            disabled={!copyTarget}
          >
            {copied ? '已复制' : '复制'}
          </button>
          <button onClick={clearAll} className="btn btn-ghost">
            清空
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">!</span>
          {error}
        </div>
      )}

      <div className="editor-container">
        <div className="panel">
          <div className="panel-header">
            <span>
              {mode === 'ts2date' ? '时间戳' : '日期时间'}
            </span>
            {mode === 'ts2date' && (
              <span className="unit-badge">{unit === 'ms' ? '毫秒' : '秒'}</span>
            )}
          </div>
          <textarea
            className="panel-input"
            placeholder={
              mode === 'ts2date'
                ? unit === 'ms'
                  ? '1730188800000'
                  : '1730188800'
                : '2024-10-30 12:00:00'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        <div className="panel">
          <div className="panel-header">
            <span>
              {mode === 'ts2date' ? '北京时间' : '时间戳'}
            </span>
            {mode === 'date2ts' && (
              <span className="unit-badge">{unit === 'ms' ? '毫秒' : '秒'}</span>
            )}
          </div>
          <pre className="panel-output">
            {output ? (
              <code>{output}</code>
            ) : (
              <span className="placeholder">
                {mode === 'ts2date'
                  ? '输入时间戳后自动转换'
                  : '输入日期时间后自动转换'}
              </span>
            )}
          </pre>
        </div>
      </div>

      <footer className="footer">
        <span>支持秒/毫秒、实时转换、一键复制</span>
        <p className="footer-sponsor">
          若对你有帮助，欢迎
          <a
            href="https://afdian.com/a/sundd1898"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-sponsor-link"
          >
            支持作者（爱发电）
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
