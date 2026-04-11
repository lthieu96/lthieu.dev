const NOISE_DATA_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")"

export function Noise({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      id="global-noise-overlay"
      aria-hidden="true"
      className={`pointer-events-none [z-index:-1] absolute inset-0 bg-repeat opacity-[0.12] dark:opacity-[0.07] ${className}`}
      style={{
        backgroundImage: NOISE_DATA_URL,
        backgroundSize: '300px 300px',
        ...style,
      }}
    />
  )
}
