import { Image as ImageIcon, Play } from 'lucide-react'
import { Arrow } from '@/components/layout'
import { DitherField } from '@/components/shaders/dither-field'
import type { CaseStudy, CaseStudyMedia, CaseStudySection } from '@/data/projects'
import { external } from '@/lib/external'

/**
 * Facts as label-over-value items that flow left to right. Each item keeps its value on one line
 * and wraps as a whole, so a long value never breaks mid-phrase in a narrow column. Phones get a
 * plain two-column grid instead.
 */
export function MetaTable({ meta, links }: Pick<CaseStudy, 'meta' | 'links'>) {
  const item = 'flex flex-col gap-0.5 sm:whitespace-nowrap'
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-line border-t pt-5 text-ui sm:flex sm:flex-wrap sm:gap-x-10">
      {meta.map((m) => (
        <div key={m.label} className={item}>
          <dt className="text-meta text-subtle">{m.label}</dt>
          <dd className="text-fg tabular-nums">{m.value}</dd>
        </div>
      ))}
      {links && links.length > 0 && (
        <div className={`${item} col-span-full`}>
          <dt className="text-meta text-subtle">Links</dt>
          <dd className="flex flex-wrap gap-x-2 text-accent">
            {links.map((l, i) => (
              <span key={l.href}>
                {i > 0 && <span className="mr-2 text-subtle">·</span>}
                <a href={l.href} className="group hover:underline" {...external(l.href)}>
                  {l.label} <Arrow dir="↗" />
                </a>
              </span>
            ))}
          </dd>
        </div>
      )}
    </dl>
  )
}

/** Media breaks out of the 600px column to 880px on wide screens. */
export function Media({ media }: { media: CaseStudyMedia }) {
  const frame = 'overflow-hidden rounded-2xl border border-line'

  return (
    <figure className="mx-auto w-full max-w-[920px] px-5">
      {media.kind === 'image' && media.phone ? (
        // Web and phone side by side at the same height: flex-grow in their width ratios
        // (1600×1000 and 720×1560 scaled to 1000 tall). Same dithered backdrop as the phones frame.
        <div className={`${frame} relative isolate flex gap-[3%] bg-media p-[4.5%]`}>
          <DitherField
            colHalf={0}
            feather={240}
            inkStrength={0.14}
            background="media"
            className="absolute inset-0 -z-10"
          />
          <video
            src={media.video}
            poster={media.src}
            aria-label={media.alt}
            autoPlay
            muted
            loop
            playsInline
            className="block aspect-[16/10] min-w-0 flex-[1600] rounded-[10px] object-cover outline outline-1 outline-edge -outline-offset-1 max-sm:rounded-md"
          />
          <video
            src={media.phone.src}
            poster={media.phone.poster}
            aria-label={media.phone.label}
            autoPlay
            muted
            loop
            playsInline
            className="block aspect-[720/1560] min-w-0 flex-[462] rounded-[20px] border border-edge object-cover max-sm:rounded-lg"
          />
        </div>
      ) : media.kind === 'image' ? (
        <div className={`${frame} relative isolate bg-media px-[4.5%] pt-[4.5%]`}>
          <DitherField
            colHalf={0}
            feather={240}
            inkStrength={0.14}
            background="media"
            className="absolute inset-0 -z-10"
          />
          {media.video ? (
            <video
              src={media.video}
              poster={media.src}
              aria-label={media.alt}
              width={1600}
              height={1000}
              autoPlay
              muted
              loop
              playsInline
              className="block w-full rounded-t-[10px] outline outline-1 outline-edge -outline-offset-1"
            />
          ) : (
            <img
              src={media.src}
              alt={media.alt}
              width={1760}
              height={989}
              className="block w-full rounded-t-[10px] outline outline-1 outline-edge -outline-offset-1"
            />
          )}
        </div>
      ) : (
        <div
          className={`${frame} relative isolate flex items-center justify-center gap-6 bg-media px-6 py-11 max-sm:gap-3 max-sm:px-3`}
        >
          <DitherField
            colHalf={0}
            feather={240}
            inkStrength={0.1}
            background="media"
            className="absolute inset-0 -z-10"
          />
          {media.slots.map((slot, i) =>
            slot.src ? (
              // The middle phone leads; the ones beside it sit smaller.
              <video
                key={slot.label}
                src={slot.src}
                poster={slot.poster}
                aria-label={slot.label}
                autoPlay
                muted
                loop
                playsInline
                className={`aspect-[1179/2556] min-w-0 rounded-[28px] border border-edge object-cover max-sm:rounded-2xl ${i === (media.slots.length - 1) / 2 ? 'w-[200px]' : 'w-[150px]'}`}
              />
            ) : (
              <div
                key={slot.label}
                className="flex aspect-[200/432] w-[200px] flex-col items-center justify-center gap-2 rounded-[28px] border border-edge bg-well p-5 text-center max-sm:rounded-2xl max-sm:p-2"
              >
                {slot.note === 'still' ? (
                  <ImageIcon size={18} aria-hidden className="text-subtle" />
                ) : (
                  <Play size={18} aria-hidden className="text-subtle" />
                )}
                <span className="text-meta text-muted">{slot.label}</span>
                <span className="font-mono text-meta text-subtle">{slot.note}</span>
              </div>
            ),
          )}
        </div>
      )}
      {media.caption && (
        <figcaption className="pt-2.5 font-mono text-meta text-subtle">{media.caption}</figcaption>
      )}
    </figure>
  )
}

const lanes = [
  { label: 'Trading · first in line', share: 300, color: 'var(--color-lane-1)' },
  { label: 'App prices', share: 150, color: 'var(--color-lane-2)' },
  { label: 'Background sync', share: 110, color: 'var(--color-lane-3)' },
]

/** Sway: how the exchange's request budget is shared. Illustrative numbers. */
function RequestBudget() {
  return (
    <figure className="mt-5 flex flex-col gap-2.5 rounded-xl border border-line bg-well p-5 font-mono text-meta text-muted">
      <figcaption>Requests per minute, shared (illustrative)</figcaption>
      <div className="flex h-2.5 overflow-hidden rounded-[3px]">
        {lanes.map((l) => (
          <div key={l.label} style={{ flexGrow: l.share, background: l.color }} />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1">
        {lanes.map((l) => (
          <li key={l.label} className="flex items-center gap-1.5">
            <span className="size-2 rounded-[2px]" style={{ background: l.color }} />
            {l.label}
          </li>
        ))}
      </ul>
    </figure>
  )
}

const figures = { 'request-budget': RequestBudget } satisfies Record<
  NonNullable<CaseStudySection['figure']>,
  () => React.ReactNode
>

export function Sections({ sections }: { sections: CaseStudySection[] }) {
  return (
    <div className="flex flex-col gap-12">
      {sections.map((s) => {
        const Figure = s.figure && figures[s.figure]
        return (
          <section key={s.heading}>
            <h2 className="text-h2 font-medium text-fg">{s.heading}</h2>
            {s.body && <p className="mt-3 text-body text-prose">{s.body}</p>}
            {s.items && (
              <ul className="mt-4 flex flex-col gap-5">
                {s.items.map((item) => (
                  <li key={item.title} className="flex gap-4">
                    <span aria-hidden className="font-mono text-ui text-subtle">
                      ·
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-body font-medium text-fg">{item.title}</h3>
                      <p className="text-list text-muted">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {Figure && <Figure />}
          </section>
        )
      })}
    </div>
  )
}
