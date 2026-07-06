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

function StatementReveal() {
  const words = statement.split(' ')

  return (
    <motion.p
      className="font-display text-[clamp(1.9rem,4.6vw,4.3rem)] leading-[1.08] text-balance text-foreground"
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

export function AboutEditorial() {
  return (
    <section className="container-editorial page-gutter py-20 sm:py-28">
      <SectionLabel index="01" title="About" />

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
        </div>

        <div className="grid grid-cols-2 content-start gap-x-8 lg:grid-cols-1 lg:gap-y-0">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="border-t border-[color:var(--layout-line)] py-5"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, ease: EASE, delay: index * 0.08 }}
            >
              <p className="font-display text-4xl text-foreground sm:text-5xl">
                {stat.value.replace('+', '')}
                <span className="text-accent-brand">+</span>
              </p>
              <p className="mt-2 font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
