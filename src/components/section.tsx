import { type ReactNode } from 'react'
import { PageFrame } from './page-frame'

// ── Diamond corner node ────────────────────────────────────────────────────────

function Diamond({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute z-[99] size-1.5 rotate-45 border border-[color:var(--layout-line)] bg-background ${className}`}
    />
  )
}

// ── Vertical line ─────────────────────────────────────────────────────────────

interface Segment {
  flex: number
  solid: boolean
}

interface SectionLinePattern {
  left: Segment[]
  midLeft: Segment[]
  midRight: Segment[]
  right: Segment[]
}

function VerticalLine({ segments, edge }: { segments: Segment[]; edge: 'left' | 'right' }) {
  const posStyle =
    edge === 'right'
      ? { right: '0.5px', transform: 'translateX(50%)' }
      : { left: '0.5px', transform: 'translateX(-50%)' }

  return (
    <div
      className="absolute top-0 bottom-0 default-border-text-color"
      style={{ width: '10px', height: '100%', ...posStyle }}
    >
      <div
        className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 flex flex-col"
        style={{ width: '1px' }}
      >
        {segments.map((seg, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: segment order is static by design
            key={i}
            style={{
              flex: seg.flex,
              width: '1px',
              ...(seg.solid
                ? { backgroundColor: 'currentColor' }
                : {
                    backgroundImage:
                      'repeating-linear-gradient(to bottom, currentColor 0px, currentColor 4px, transparent 4px, transparent 8px)',
                  }),
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Segment presets (match zed.dev values) ────────────────────────────────────

const DEFAULT_LINE_PATTERN: SectionLinePattern = {
  left: [
    { flex: 2.18, solid: true },
    { flex: 4.2, solid: true },
    { flex: 3.41, solid: false },
    { flex: 4.7, solid: false },
  ],
  midLeft: [
    { flex: 4.92, solid: true },
    { flex: 4.52, solid: false },
    { flex: 4.03, solid: true },
  ],
  midRight: [
    { flex: 1.22, solid: true },
    { flex: 2.21, solid: true },
    { flex: 3.39, solid: false },
    { flex: 2.02, solid: true },
  ],
  right: [
    { flex: 1.3, solid: false },
    { flex: 4.34, solid: true },
    { flex: 3.34, solid: false },
  ],
}

const INFORMATION_LINE_PATTERN: SectionLinePattern = {
  left: [
    { flex: 1.72, solid: true },
    { flex: 2.86, solid: false },
    { flex: 3.64, solid: true },
    { flex: 4.48, solid: false },
  ],
  midLeft: [
    { flex: 2.14, solid: false },
    { flex: 3.28, solid: true },
    { flex: 2.12, solid: false },
    { flex: 3.46, solid: true },
  ],
  midRight: [
    { flex: 2.48, solid: true },
    { flex: 2.62, solid: false },
    { flex: 3.14, solid: true },
    { flex: 2.76, solid: false },
  ],
  right: [
    { flex: 1.94, solid: false },
    { flex: 3.86, solid: true },
    { flex: 2.58, solid: false },
    { flex: 3.12, solid: true },
  ],
}

const SECTION_LINE_PATTERNS = {
  default: DEFAULT_LINE_PATTERN,
  information: INFORMATION_LINE_PATTERN,
} satisfies Record<string, SectionLinePattern>

export type SectionLinePatternName = keyof typeof SECTION_LINE_PATTERNS

const OUTER_LEFT_TOP_DIAMOND = '-top-[0.5px] right-[0.5px] translate-x-1/2 -translate-y-1/2'
const OUTER_LEFT_BOTTOM_DIAMOND = '-bottom-[0.5px] right-[0.5px] translate-x-1/2 translate-y-1/2'
const OUTER_RIGHT_TOP_DIAMOND = '-top-[0.5px] left-[0.5px] -translate-x-1/2 -translate-y-1/2'
const OUTER_RIGHT_BOTTOM_DIAMOND = '-bottom-[0.5px] left-[0.5px] -translate-x-1/2 translate-y-1/2'
const INNER_LEFT_TOP_DIAMOND =
  '-top-[0.5px] -left-[0.5px] hidden -translate-x-1/2 -translate-y-1/2 md:block'
const INNER_RIGHT_TOP_DIAMOND =
  '-top-[0.5px] -right-[0.5px] hidden translate-x-1/2 -translate-y-1/2 md:block'
const INNER_LEFT_BOTTOM_DIAMOND =
  '-bottom-[0.5px] -left-[0.5px] hidden -translate-x-1/2 translate-y-1/2 md:block'
const INNER_RIGHT_BOTTOM_DIAMOND =
  '-bottom-[0.5px] -right-[0.5px] hidden translate-x-1/2 translate-y-1/2 md:block'

// ── Section ───────────────────────────────────────────────────────────────────

export function Section({
  children,
  minHeight,
  className = '',
  linePattern = 'default',
}: {
  children: ReactNode
  minHeight?: string
  className?: string
  linePattern?: SectionLinePatternName
}) {
  const pattern = SECTION_LINE_PATTERNS[linePattern]

  return (
    <PageFrame
      as="section"
      className={className}
      style={minHeight ? { minHeight } : undefined}
      // Outer corner diamonds are inside each margin column, centered on their edge
      leftSlot={
        <>
          <VerticalLine segments={pattern.left} edge="right" />
          {/* top-left & bottom-left outer diamonds */}
          <Diamond className={OUTER_LEFT_TOP_DIAMOND} />
          <Diamond className={OUTER_LEFT_BOTTOM_DIAMOND} />
        </>
      }
      midLeftSlot={<VerticalLine segments={pattern.midLeft} edge="right" />}
      midRightSlot={<VerticalLine segments={pattern.midRight} edge="left" />}
      rightSlot={
        <>
          <VerticalLine segments={pattern.right} edge="left" />
          {/* top-right & bottom-right outer diamonds */}
          <Diamond className={OUTER_RIGHT_TOP_DIAMOND} />
          <Diamond className={OUTER_RIGHT_BOTTOM_DIAMOND} />
        </>
      }
    >
      {/* Inner diamonds at content column edges (md+) */}
      <Diamond className={INNER_LEFT_TOP_DIAMOND} />
      <Diamond className={INNER_RIGHT_TOP_DIAMOND} />
      <Diamond className={INNER_LEFT_BOTTOM_DIAMOND} />
      <Diamond className={INNER_RIGHT_BOTTOM_DIAMOND} />

      {children}
    </PageFrame>
  )
}
