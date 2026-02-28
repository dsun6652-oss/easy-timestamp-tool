import { useState, useEffect } from 'react'
import { locales } from './locales'

const STORAGE_KEY = 'easy-timestamp-tool-lang'

export function useI18n() {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || (navigator.language.startsWith('zh') ? 'zh' : 'en')
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  const setLang = (l) => setLangState(l === 'zh' ? 'zh' : 'en')
  const t = (key) => locales[lang]?.[key] ?? key

  return { t, lang, setLang }
}
