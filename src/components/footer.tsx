import { ShaderBackground } from '@/components/shader-background'

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
      {/* Shader as regular HTML element covering full footer */}
      <div className="absolute inset-0">
        <ShaderBackground />
      </div>

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
          {/* Mask: white=show background, black=show shader through */}
          <mask id="footer-bg-mask">
            {/* Cover far beyond viewBox so overflow:visible areas are also masked */}
            <rect x="-2000" y="-500" width="5000" height="1500" fill="white" />
            <text
              x="0"
              y="278"
              textAnchor="start"
              fontSize="350"
              fontWeight="800"
              textLength="1000"
              lengthAdjust="spacingAndGlyphs"
              fill="black"
              style={{ fontFamily: 'Gloock, serif' }}
            >
              HieuLe
            </text>
          </mask>
        </defs>

        {/* Rect covering entire footer (incl. overflow areas), text-shaped holes reveal shader */}
        <rect x="-2000" y="-500" width="5000" height="1500" fill="var(--background)" mask="url(#footer-bg-mask)" />

        {/* Stroke outline on top */}
        <text
          x="0"
          y="278"
          textAnchor="start"
          fill="none"
          stroke="var(--layout-line)"
          strokeWidth="0.5"
          fontSize="350"
          fontWeight="800"
          textLength="1000"
          lengthAdjust="spacingAndGlyphs"
          style={{ fontFamily: 'Gloock, serif' }}
        >
          HieuLe
        </text>
      </svg>

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
