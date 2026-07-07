'use client'

import { motion } from 'motion/react'
import { SectionLabel } from '@/components/section-label'

const EASE = [0.22, 1, 0.36, 1] as const

const statement =
  'I build products end to end — clean, fast interfaces backed by systems that hold up in production.'

const stats = [
  { value: '2+', label: 'Years shipping products' },
  { value: '200k+', label: 'Users supported' },
  { value: '7k+', label: 'Daily active users' },
  { value: '3.8k+', label: 'Customers digitized' },
]

const notes = [
  'All dimensions in pixels unless noted otherwise.',
  'Interfaces drawn to scale — performance verified in production.',
  'Assembly covers UI, dashboards, APIs and data pipelines.',
]

function StatementReveal() {
  const words = statement.split(' ')

  return (
    <motion.p
      className="font-display text-[clamp(1.8rem,4.4vw,4rem)] leading-[1.08] font-medium text-balance text-foreground"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-15%' }}
      transition={{ staggerChildren: 0.035 }}
    >
      {words.map((word, index) => (
        <motion.span
          // biome-ignore lint/suspicious/noArrayIndexKey: words can repeat; order is static
          key={index}
          className="inline"
          variants={{
            hidden: { opacity: 0.12 },
            visible: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
          }}
        >
          {word}
          {index < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </motion.p>
  )
}

export function AboutTechnical() {
  return (
    <section className="container-editorial page-gutter py-20 sm:py-28">
      <SectionLabel index="01" title="Specifications" />

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <StatementReveal />

          <motion.p
            className="mt-8 max-w-xl text-[15px] leading-7 text-muted-foreground"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
          >
            My work usually sits somewhere between product features and internal operations:
            helping build clean user-facing experiences, while also supporting the dashboards,
            admin tools, and backend workflows that keep the product usable for the team. Currently
            a Software Engineer at{' '}
            <a
              href="https://kvytechnology.com/"
              target="_blank"
              rel="noreferrer"
              className="text-foreground underline decoration-accent-brand decoration-1 underline-offset-4 transition-colors hover:text-accent-brand"
            >
              KVY Technology
            </a>
            .
          </motion.p>

          {/* general notes, as found in the corner of a drawing sheet */}
          <motion.div
            className="mt-10 max-w-xl border border-[color:var(--layout-line)]"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
          >
            <p className="border-b border-[color:var(--layout-line)] px-4 py-2 font-mono text-[10px] tracking-[0.24em] text-muted-foreground uppercase">
              General notes
            </p>
            <ol className="space-y-1.5 px-4 py-3.5">
              {notes.map((note, index) => (
                <li
                  key={note}
                  className="flex gap-3 font-mono text-[11px] leading-5 tracking-[0.04em] text-muted-foreground uppercase"
                >
                  <span className="text-accent-brand">{index + 1}.</span>
                  {note}
                </li>
              ))}
            </ol>
          </motion.div>
        </div>

        {/* data table — bordered cells like a parts list */}
        <motion.div
          className="grid h-fit grid-cols-2 gap-px border border-[color:var(--layout-line)] bg-[color:var(--layout-line)] lg:grid-cols-1"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
        >
          <p className="col-span-full bg-background px-5 py-2 font-mono text-[10px] tracking-[0.24em] text-muted-foreground uppercase">
            Data table
          </p>
          {stats.map((stat) => (
            <div key={stat.label} className="bg-background px-5 py-5">
              <p className="font-display text-4xl font-bold text-foreground tabular-nums sm:text-5xl">
                {stat.value.replace('+', '')}
                <span className="text-accent-brand">+</span>
              </p>
              <p className="mt-2 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
