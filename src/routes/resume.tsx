import { createFileRoute } from '@tanstack/react-router'
import { Printer } from 'lucide-react'
import type { ReactNode } from 'react'
import { delay, TopBar } from '@/components/layout'
import { resume } from '@/data/resume'
import { external } from '@/lib/external'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/resume')({
  head: () => ({
    meta: seo({ title: 'Resume', description: resume.summary.replaceAll('**', '') }),
    // A4, no browser margins: the sheet carries its own padding.
    styles: [{ media: 'print', children: '@page { size: A4; margin: 0 }' }],
  }),
  component: Resume,
})

function Heading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[10.5px]/[1.5] font-semibold tracking-[1.4px] text-[#8a8a8a] uppercase">
      {children}
    </h2>
  )
}

const link =
  'underline decoration-[#cfcfcf] underline-offset-2 transition-[text-decoration-color] duration-150 hover:decoration-current'

/** Renders **bold** (metrics) and [label](url) links, so they stay clickable in the PDF too. */
function Rich({ text }: { text: string }) {
  // The capture group keeps the markers in the result: odd parts are **…** or […](…).
  return text.split(/(\*\*.+?\*\*|\[.+?\]\(.+?\))/).map((part, i) => {
    const bold = part.match(/^\*\*(.+)\*\*$/)
    const anchor = part.match(/^\[(.+)\]\((.+)\)$/)
    // biome-ignore-start lint/suspicious/noArrayIndexKey: split parts never reorder
    if (bold)
      return (
        <strong key={i} className="font-semibold text-[#1a1a1a]">
          {bold[1]}
        </strong>
      )
    if (anchor)
      return (
        <a key={i} href={anchor[2]} className={link} {...external(anchor[2])}>
          {anchor[1]}
        </a>
      )
    // biome-ignore-end lint/suspicious/noArrayIndexKey: split parts never reorder
    return part
  })
}

function Bullets({ bullets }: { bullets: string[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {bullets.map((b) => (
        <li key={b} className="flex gap-1.5 text-[12px]/[1.5] text-[#3d3d3d]">
          <span aria-hidden className="text-[#999]">
            •
          </span>
          <span className="text-pretty">
            <Rich text={b} />
          </span>
        </li>
      ))}
    </ul>
  )
}

type Group = { title: string; when: string; bullets: string[] }

/** "Name · what it is": the name leads, the rest steps back. */
function Title({ text, className }: { text: string; className: string }) {
  const [name, ...rest] = text.split(' · ')
  return (
    <h3 className={className}>
      <Rich text={name} />
      {rest.length > 0 && (
        <span className="font-normal text-[#666]">
          {' · '}
          <Rich text={rest.join(' · ')} />
        </span>
      )}
    </h3>
  )
}

const when = 'shrink-0 text-[12px]/[1.5] text-[#777] tabular-nums'

/**
 * Hierarchy comes from size, weight and tone only: the company (14px semibold), a product under it
 * (12.5px medium), then the bullets (12px, a shade lighter so the headings carry the page).
 */
function Entry({ title, when: date, bullets, groups }: Group & { groups?: Group[] }) {
  return (
    <div className="flex flex-col gap-1 pb-1.5">
      <div className="flex items-baseline justify-between gap-4">
        <Title text={title} className="text-[14px]/[1.4] font-semibold tracking-[-0.1px]" />
        <span className={when}>{date}</span>
      </div>
      {bullets.length > 0 && <Bullets bullets={bullets} />}
      {groups?.map((g) => (
        <div key={g.title} className="mt-0.5 flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-4">
            <Title text={g.title} className="text-[12.5px]/[1.5] font-medium" />
            <span className={when}>{g.when}</span>
          </div>
          <Bullets bullets={g.bullets} />
        </div>
      ))}
    </div>
  )
}

function Resume() {
  return (
    <main className="mx-auto flex w-fit flex-col gap-6 px-5 pt-12 pb-24 print:p-0">
      <div className="w-[794px] max-w-full print:hidden">
        <TopBar back="/" label="Home" />
      </div>

      <article
        className="enter flex w-[794px] min-h-[1123px] flex-col gap-[22px] bg-white px-16 py-14 text-[#1a1a1a] shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-8px_rgb(0_0_0/0.12)] print:shadow-none narrow-screen:w-full narrow-screen:px-6"
        style={delay(1)}
      >
        <header className="flex items-end justify-between border-[#e5e5e5] border-b pb-3.5">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-[28px]/[1.15] font-semibold tracking-[-0.6px]">{resume.name}</h1>
            <p className="text-[13px]/[1.5] text-[#555]">{resume.headline}</p>
          </div>
          <ul className="flex flex-col items-end gap-px text-[12px]/[1.5] text-[#555]">
            {resume.contact.map((c) => (
              <li key={c.href}>
                <a
                  href={c.href}
                  className="hover:text-[#1a1a1a] hover:underline"
                  {...external(c.href)}
                >
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </header>

        <section className="flex flex-col gap-2">
          <Heading>Summary</Heading>
          <p className="text-[12.5px]/[1.55]">
            <Rich text={resume.summary} />
          </p>
        </section>

        <section className="flex flex-col gap-2">
          <Heading>Experience</Heading>
          {resume.experience.map((e) => (
            <Entry key={e.title} {...e} />
          ))}
        </section>

        <section className="flex flex-col gap-2">
          <Heading>Skills</Heading>
          <dl className="flex flex-col gap-1 text-[12px]/[1.5]">
            {resume.skills.map((s) => (
              <div key={s.label} className="flex gap-3">
                <dt className="w-20 shrink-0 text-[#777]">{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="flex flex-col gap-2">
          <Heading>Education</Heading>
          <div className="flex items-baseline justify-between gap-4">
            <Title text={resume.education.title} className="text-[12.5px]/[1.5] font-medium" />
            <span className={when}>{resume.education.when}</span>
          </div>
        </section>
      </article>

      <button
        type="button"
        onClick={() => window.print()}
        className="enter flex items-center gap-1.5 self-center rounded-full border border-line bg-well px-3 py-1.5 text-meta text-fg transition-[background-color,scale] duration-150 ease-(--ease-out) hover:bg-hover active:scale-[0.97] print:hidden"
        style={delay(2)}
      >
        <Printer size={13} aria-hidden className="text-muted" />
        Print or save as PDF
      </button>
    </main>
  )
}
