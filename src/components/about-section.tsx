'use client'

import { BarChart07, Briefcase01, LayersTwo01, Zap } from '@untitledui/icons'
import { Section } from '@/components/section'

const highlights = [
  {
    icon: Briefcase01,
    label: '2+ years',
    detail:
      'Building and maintaining full-stack products, from user-facing apps to internal tooling.',
  },
  {
    icon: Zap,
    label: '200k+ users',
    detail:
      'Part of the team building Cerebro, supporting 7k+ daily active users with real-time crypto data.',
  },
  {
    icon: LayersTwo01,
    label: 'Multi-platform support',
    detail:
      'Helping deliver dashboards, CMS foundations, and mobile/tablet applications for diverse needs.',
  },
  {
    icon: BarChart07,
    label: 'Reliable operations',
    detail:
      'Built ERP-style systems to help digitize workflows for 3,800+ customers and 200 technicians.',
  },
]

export function AboutSection() {
  return (
    <Section>
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            About
          </p>
          <h2 className="mt-3 font-serif text-2xl leading-tight text-foreground sm:text-3xl">
            Full-stack developer who enjoys building useful products and learning how systems grow.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-[15px]">
            My work usually sits somewhere between product features and internal operations: helping
            build clean user-facing experiences, while also supporting the dashboards, admin tools,
            and backend workflows that keep the product usable for the team.
          </p>
        </div>

        <div className="mt-8 grid gap-x-8 gap-y-5 md:grid-cols-2">
          {highlights.map(({ icon: Icon, label, detail }) => (
            <div key={label} className="border-t border-[color:var(--layout-line)] pt-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center text-muted-foreground">
                  <Icon className="size-4" strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-sm text-foreground">{label}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{detail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
