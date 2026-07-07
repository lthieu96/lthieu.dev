import { CrossMark } from '@/components/cross-mark'

export function Footer() {
  return (
    <footer
      aria-hidden="true"
      className={[
        'fixed bottom-0 left-0 right-0 z-0 overflow-hidden bg-background select-none',
        'h-[150px] sm:h-[210px] lg:h-[300px]',
        '[--footer-svg-h:170px] [--footer-svg-bottom:-20px] [--footer-blur-h:36px]',
        'sm:[--footer-svg-h:220px] sm:[--footer-svg-bottom:-35px] sm:[--footer-blur-h:44px]',
        'lg:[--footer-svg-h:330px] lg:[--footer-svg-bottom:-50px] lg:[--footer-blur-h:56px]',
      ].join(' ')}
    >
      {/* Blueprint fill — revealed through the wordmark so it reads as drawn on graph paper */}
      <div className="absolute inset-0" style={{ background: 'var(--accent-brand-soft)' }} />
      <div className="drafting-grid absolute inset-0" />
      <div className="hatch absolute inset-0 opacity-30" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(130% 150% at 12% 100%, var(--accent-brand-soft), transparent 55%)',
        }}
      />

      <svg
        viewBox="0 0 1000 300"
        preserveAspectRatio="xMidYMax meet"
        className="absolute inset-x-0 w-full"
        style={{
          bottom: 'var(--footer-svg-bottom)',
          height: 'var(--footer-svg-h)',
          overflow: 'visible',
        }}
        aria-hidden="true"
      >
        <defs>
          {/* Mask: white=show background, black=show the blueprint fill through */}
          <mask id="footer-bg-mask">
            {/* Cover far beyond viewBox so overflow:visible areas are also masked */}
            <rect x="-2000" y="-500" width="5000" height="1500" fill="white" />
            <text
              x="0"
              y="278"
              textAnchor="start"
              fontSize="350"
              fontWeight="700"
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              fill="black"
              style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
            >
              hieu.le
            </text>
          </mask>
        </defs>

        {/* Rect covering entire footer (incl. overflow areas), text-shaped holes reveal fill */}
        <rect
          x="-2000"
          y="-500"
          width="5000"
          height="1500"
          fill="var(--background)"
          mask="url(#footer-bg-mask)"
        />

        {/* Stroke outline on top */}
        <text
          x="0"
          y="278"
          textAnchor="start"
          fill="none"
          stroke="var(--layout-line)"
          strokeWidth="0.7"
          fontSize="350"
          fontWeight="700"
          textLength="1000"
          lengthAdjust="spacingAndGlyphs"
          style={{ fontFamily: 'var(--font-space-grotesk), sans-serif' }}
        >
          hieu.le
        </text>
      </svg>

      {/* Ruled bottom edge of the sheet — label row + tick graduations */}
      <div className="absolute inset-x-0 top-0 border-t border-[color:var(--layout-line)]">
        <div className="container-editorial page-gutter flex items-center justify-between py-2">
          <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
            Signature block
          </span>
          <span className="hidden font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase sm:inline">
            Scale 1:1 · Not to spec
          </span>
          <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground uppercase">
            DWG LTH-2026-01
          </span>
        </div>
        <div
          className="h-2 w-full border-t border-[color:var(--layout-line)]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to right, var(--layout-line) 0, var(--layout-line) 1px, transparent 1px, transparent 22px)',
          }}
        />
      </div>

      {/* Registration crosshairs at the sheet corners */}
      <div className="absolute inset-0 text-foreground/30">
        <CrossMark className="top-12 left-2.5" />
        <CrossMark className="top-12 right-2.5" />
        <CrossMark className="bottom-2.5 left-2.5" />
        <CrossMark className="right-2.5 bottom-2.5" />
      </div>

      {/* Gradient fade at bottom */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: 'var(--footer-blur-h)',
          background: 'linear-gradient(to top, var(--background) 30%, transparent)',
        }}
      />
    </footer>
  )
}
