import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const KEY = 'theme'
const root = () => document.documentElement

/** Light unless the visitor picked dark. The prerendered <html> already says light. */
export const DEFAULT_THEME: Theme = 'light'

/** Runs inline in <head> before first paint and applies a saved choice, if there is one. */
export const themeScript = `(function(){try{var s=localStorage.getItem('${KEY}');if(s==='light'||s==='dark')document.documentElement.dataset.theme=s}catch(e){}})()`

/** The theme on <html>. */
export function useTheme(): Theme {
  return useSyncExternalStore(
    (onChange) => {
      const observer = new MutationObserver(onChange)
      observer.observe(root(), { attributes: true, attributeFilter: ['data-theme'] })
      return () => observer.disconnect()
    },
    () => (root().dataset.theme === 'dark' ? 'dark' : 'light'),
    () => DEFAULT_THEME,
  )
}

/** Save and apply a theme, crossfading where View Transitions are supported. */
export function setTheme(theme: Theme) {
  localStorage.setItem(KEY, theme)
  const apply = () => {
    root().dataset.theme = theme
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduced) apply()
  else document.startViewTransition(apply)
}

/** A token from app.css as [r, g, b] in 0..1, for shader uniforms. Reads the live theme. */
export function cssColor(token: string) {
  // Prerender has no styles; shader uniforms only matter in the browser anyway.
  if (typeof document === 'undefined') return [0, 0, 0]
  const value = getComputedStyle(root()).getPropertyValue(`--color-${token}`).trim()
  const hex = value.replace('#', '')
  const full = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex
  return [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16) / 255)
}
