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
          <span className="font-display text-2xl whitespace-nowrap text-foreground/80 uppercase sm:text-3xl">
            {item}
          </span>
          <span aria-hidden="true" className="mx-6 text-lg text-accent-brand sm:mx-8">
            ✦
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
      className="overflow-hidden border-y border-[color:var(--layout-line)] py-4 select-none sm:py-5"
    >
      <div className="marquee-track flex w-max">
        <MarqueeHalf />
        <MarqueeHalf />
      </div>
    </div>
  )
}
