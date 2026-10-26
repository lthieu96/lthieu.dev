import { useSyncExternalStore } from 'react'

/** False during prerender and hydration, then tracks the query. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** The system asks for reduced motion and the visitor hasn't turned animation back on. */
export function useReducedMotion() {
  const reduce = useMediaQuery('(prefers-reduced-motion: reduce)')
  const forced = useMotionForced()
  return reduce && !forced
}

// The footer's "enable animation" switch. It lives on <html> as data-motion, so CSS sees it too
// (the motion-reduce variant in app.css), and lasts until a reload.
const forcedListeners = new Set<() => void>()

export function forceMotion(on: boolean) {
  document.documentElement.toggleAttribute('data-motion', on)
  for (const l of forcedListeners) l()
}

export function useMotionForced() {
  return useSyncExternalStore(
    (onChange) => {
      forcedListeners.add(onChange)
      return () => {
        forcedListeners.delete(onChange)
      }
    },
    () => document.documentElement.hasAttribute('data-motion'),
    () => false,
  )
}
