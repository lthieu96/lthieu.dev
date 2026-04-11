export function DividerSlash() {
  const patternId = 'divider-slash-pattern'

  return (
    <section
      aria-hidden="true"
      className="relative h-3.5 w-full
				before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-border
				after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border"
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full select-none [z-index:-1] py-[1px] text-[color:var(--layout-line)] opacity-60"
      >
        <defs>
          <pattern
            id={patternId}
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </section>
  )
}
