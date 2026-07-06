'use client'

import { ArrowUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import { SectionLabel } from '@/components/section-label'
import { contact } from '@/data/resume'

const EASE = [0.22, 1, 0.36, 1] as const

const links = [
  { label: 'GitHub', href: contact.github, external: true },
  { label: 'LinkedIn', href: contact.linkedin, external: true },
  { label: 'Resume', href: '/resume.pdf', download: 'hieu-le-resume.pdf' },
]

export function ContactCta() {
  return (
    <section className="container-editorial page-gutter pt-20 pb-16 sm:pt-28">
      <SectionLabel index="05" title="Contact" />

      <motion.a
        href={`mailto:${contact.email}`}
        className="group mt-10 block"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <span className="block font-display text-[clamp(2.8rem,9.5vw,8.5rem)] leading-[0.95] text-foreground uppercase transition-colors duration-300 group-hover:text-accent-brand">
          Let&rsquo;s work
        </span>
        <span className="flex items-center gap-4 font-display text-[clamp(2.8rem,9.5vw,8.5rem)] leading-[0.95] text-foreground uppercase transition-colors duration-300 group-hover:text-accent-brand">
          together
          <span className="inline-flex size-[0.7em] items-center justify-center rounded-full border border-[color:var(--layout-line)] text-accent-brand transition-transform duration-300 group-hover:rotate-45">
            <ArrowUpRight className="size-[0.4em]" />
          </span>
        </span>
      </motion.a>

      <motion.div
        className="mt-12 flex flex-col gap-6 border-t border-[color:var(--layout-line)] pt-6 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-5%' }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
      >
        <div className="space-y-1 font-mono text-xs text-muted-foreground">
          <p>
            <a href={`mailto:${contact.email}`} className="transition-colors hover:text-accent-brand">
              {contact.email}
            </a>
          </p>
          <p>
            <a href={contact.phoneHref} className="transition-colors hover:text-accent-brand">
              {contact.phone}
            </a>
            {' · '}
            {contact.location}
          </p>
        </div>

        <div className="flex items-center gap-6">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
              download={link.download}
              className="group/link inline-flex items-center gap-1 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-accent-brand"
            >
              {link.label}
              <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
            </a>
          ))}
        </div>
      </motion.div>

      <p className="mt-10 font-mono text-[10px] tracking-[0.14em] text-muted-foreground/70 uppercase">
        © 2026 Hieu Le · Type set in Gloock &amp; Geist
      </p>
    </section>
  )
}
