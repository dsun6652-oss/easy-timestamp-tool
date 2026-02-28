import { useState, useCallback, useEffect } from 'react'
import { useI18n } from './useI18n'
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
  const { t, lang, setLang } = useI18n()
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
        setError(t('errorInvalidTs'))
      }
    } else {
      const result = dateToTimestamp(input.trim(), unit === 'ms')
      if (result !== null) {
        setOutput(String(result))
      } else {
        setError(t('errorInvalidDate'))
      }
    }
  }, [mode, unit, input, t])

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      setError('')
      return
    }
    convert()
  }, [input, mode, unit, t])

  const copyToClipboard = useCallback(async () => {
    const text = output || input
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError(t('errorCopy'))
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
        <div className="header-top">
          <h1>{t('title')}</h1>
          <button
            className="lang-switcher"
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            title={lang === 'zh' ? 'Switch to English' : '切换到中文'}
          >
            {lang === 'zh' ? 'EN' : '中'}
          </button>
        </div>
        <p className="subtitle">{t('subtitle')}</p>
      </header>

      <div className="toolbar">
        <div className="toolbar-left">
          <button
            onClick={() => setMode('ts2date')}
            className={`btn ${mode === 'ts2date' ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t('ts2date')}
          </button>
          <button
            onClick={() => setMode('date2ts')}
            className={`btn ${mode === 'date2ts' ? 'btn-primary' : 'btn-secondary'}`}
          >
            {t('date2ts')}
          </button>
          <label className="unit-control">
            <span>{t('unit')}</span>
            <select value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="ms">{t('ms')}</option>
              <option value="s">{t('s')}</option>
            </select>
          </label>
          {mode === 'ts2date' && (
            <button onClick={setNow} className="btn btn-secondary">
              {t('now')}
            </button>
          )}
        </div>
        <div className="toolbar-right">
          <button
            onClick={copyToClipboard}
            className="btn btn-ghost"
            disabled={!copyTarget}
          >
            {copied ? t('copied') : t('copy')}
          </button>
          <button onClick={clearAll} className="btn btn-ghost">
            {t('clear')}
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
              {mode === 'ts2date' ? t('timestamp') : t('dateTime')}
            </span>
            {mode === 'ts2date' && (
              <span className="unit-badge">{unit === 'ms' ? t('ms') : t('s')}</span>
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
              {mode === 'ts2date' ? t('beijingTime') : t('timestamp')}
            </span>
            {mode === 'date2ts' && (
              <span className="unit-badge">{unit === 'ms' ? t('ms') : t('s')}</span>
            )}
          </div>
          <pre className="panel-output">
            {output ? (
              <code>{output}</code>
            ) : (
              <span className="placeholder">
                {mode === 'ts2date'
                  ? t('placeholderTs')
                  : t('placeholderDate')}
              </span>
            )}
          </pre>
        </div>
      </div>

      <footer className="footer">
        <span>{t('footerDesc')}</span>
        <p className="footer-sponsor">
          {t('supportAuthor')}
          <a
            href="https://afdian.com/a/sundd1898"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-sponsor-link"
          >
            {t('supportLink')}
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
