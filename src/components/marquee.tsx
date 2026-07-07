import { Fragment } from 'react'

const items = [
  'Fullstack Developer',
  'Next.js',
  'NestJS',
  'TypeScript',
  'Real-time Data',
  'Product Engineering',
  'Ho Chi Minh City',
]

function MarqueeHalf() {
  return (
    <div className="flex shrink-0 items-center">
      {items.map((item) => (
        <Fragment key={item}>
          <span className="font-display text-2xl font-bold whitespace-nowrap text-foreground/80 uppercase sm:text-3xl">
            {item}
          </span>
          <span
            aria-hidden="true"
            className="mx-6 font-mono text-lg font-light text-accent-brand sm:mx-8"
          >
            +
          </span>
        </Fragment>
      ))}
    </div>
  )
}

export function Marquee() {
  return (
    <div
      aria-hidden="true"
      className="border-y border-[color:var(--layout-line)] select-none"
    >
      {/* hatched cut-surface strips framing the title band */}
      <div className="hatch h-2.5 border-b border-[color:var(--layout-line)]" />
      <div className="overflow-hidden py-4 sm:py-5">
        <div className="marquee-track flex w-max">
          <MarqueeHalf />
          <MarqueeHalf />
        </div>
      </div>
      <div className="hatch h-2.5 border-t border-[color:var(--layout-line)]" />
    </div>
  )
}
