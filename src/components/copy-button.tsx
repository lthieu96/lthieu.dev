import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/** An icon button that copies `text()` and turns into a check for 1.5s. */
export function CopyButton({
  text,
  label,
  className = '',
}: {
  text: () => string
  label: string
  /** Display, size and position; the button sets everything else. */
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    await navigator.clipboard.writeText(text())
    setCopied(true)
    // From the last click, so a second copy keeps the check up for the full 1.5s.
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={label}
        className={`place-items-center text-subtle transition-[color,scale] duration-150 ease-(--ease-out) hover:text-fg active:scale-[0.97] ${className}`}
      >
        {/* Both icons stay mounted and cross-fade, so the swap never shifts layout. */}
        <Copy
          size={13}
          aria-hidden
          className={`col-start-1 row-start-1 transition-[opacity,scale,filter] duration-200 ease-(--ease-out) ${copied ? 'scale-50 opacity-0 blur-[2px] motion-reduce:scale-100' : ''}`}
        />
        <Check
          size={13}
          aria-hidden
          className={`col-start-1 row-start-1 transition-[opacity,scale,filter] duration-200 ease-(--ease-out) ${copied ? '' : 'scale-50 opacity-0 blur-[2px] motion-reduce:scale-100'}`}
        />
      </button>
      <span role="status" className="sr-only">
        {copied ? 'Copied' : ''}
      </span>
    </>
  )
}
