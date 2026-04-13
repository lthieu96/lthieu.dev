'use client'

import { Briefcase01, Database01, LayoutGrid01, Users03 } from '@untitledui/icons'
import { motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { Section } from '@/components/section'

const highlights = [
  {
    icon: Briefcase01,
    label: '2+ years',
    detail:
      'Building and maintaining full-stack products, from user-facing apps to internal tooling.',
  },
  {
    icon: Users03,
    label: '200k+ users',
    detail:
      'Part of the team building Cerebro, supporting 7k+ daily active users with real-time crypto data.',
  },
  {
    icon: LayoutGrid01,
    label: 'Multi-platform support',
    detail:
      'Helping deliver dashboards, CMS foundations, and mobile/tablet applications for diverse needs.',
  },
  {
    icon: Database01,
    label: 'Reliable operations',
    detail:
      'Built ERP-style systems to help digitize workflows for 3,800+ customers and 200 technicians.',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export function AboutSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <Section>
      <div ref={ref} className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="max-w-2xl">
          <motion.p
            className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase"
            variants={fadeUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            About
          </motion.p>
          <motion.h2
            className="mt-3 font-serif text-2xl leading-tight text-foreground sm:text-3xl"
            variants={fadeUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.08 }}
          >
            Full-stack developer who enjoys building useful products and learning how systems grow.
          </motion.h2>
          <motion.p
            className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-[15px]"
            variants={fadeUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.16 }}
          >
            My work usually sits somewhere between product features and internal operations: helping
            build clean user-facing experiences, while also supporting the dashboards, admin tools,
            and backend workflows that keep the product usable for the team.
          </motion.p>
        </div>

        <div className="mt-8 grid gap-x-8 gap-y-5 md:grid-cols-2">
          {highlights.map(({ icon: Icon, label, detail }, index) => (
            <motion.div
              key={label}
              className="border-t border-[color:var(--layout-line)] pt-4"
              variants={fadeUp}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.26 + index * 0.08 }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center text-muted-foreground">
                  <Icon className="size-4" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-sm text-foreground">{label}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  )
}
