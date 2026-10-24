import { useEffect, useState } from 'react'

/**
 * False on the first render, true from the next frame. WebGL canvases wait for it: creating a
 * context and compiling shaders takes ~5ms each, and inside a page transition that work holds the
 * transition back (the browser doesn't run frame callbacks until the new page is in place).
 */
export function useAfterPaint() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])
  return ready
}
