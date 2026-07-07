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

function TitleCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-background px-4 py-3 sm:px-5">
      <p className="font-mono text-[9px] tracking-[0.22em] text-muted-foreground/80 uppercase">
        {label}
      </p>
      <p className="mt-1.5 font-mono text-xs tracking-[0.08em] text-foreground uppercase">
        {children}
      </p>
    </div>
  )
}

export function ContactTechnical() {
  return (
    <section className="container-editorial page-gutter pt-20 pb-16 sm:pt-28">
      <SectionLabel index="05" title="Sign-off" />

      <motion.a
        href={`mailto:${contact.email}`}
        className="group mt-10 block"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <span className="block font-display text-[clamp(2.8rem,9.5vw,8.5rem)] leading-[0.95] font-bold text-foreground uppercase transition-colors duration-300 group-hover:text-accent-brand">
          Let&rsquo;s work
        </span>
        <span className="flex items-center gap-4 font-display text-[clamp(2.8rem,9.5vw,8.5rem)] leading-[0.95] font-bold text-foreground uppercase transition-colors duration-300 group-hover:text-accent-brand">
          together
          <span className="inline-flex size-[0.7em] items-center justify-center border border-[color:var(--layout-line)] text-accent-brand transition-transform duration-300 group-hover:rotate-45">
            <ArrowUpRight className="size-[0.4em]" />
          </span>
        </span>
      </motion.a>

      {/* ISO 7200-style title block */}
      <motion.div
        className="mt-14 flex flex-col gap-px border border-[color:var(--layout-line)] bg-[color:var(--layout-line)]"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-5%' }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
      >
        <div className="grid grid-cols-2 gap-px md:grid-cols-4">
          <TitleCell label="Drawn by">Hieu Le</TitleCell>
          <TitleCell label="Project">Portfolio — 2026</TitleCell>
          <TitleCell label="Scale">1:1</TitleCell>
          <TitleCell label="Rev">A</TitleCell>
        </div>

        <div className="grid grid-cols-2 gap-px md:grid-cols-4">
          <TitleCell label="Date">2026.07</TitleCell>
          <TitleCell label="Location">{contact.location}</TitleCell>
          <TitleCell label="Sheet">1 of 1</TitleCell>
          <TitleCell label="Status">
            <span className="text-accent-brand">Open to work</span>
          </TitleCell>
        </div>

        <div className="grid gap-px md:grid-cols-2">
          {/* approval cell — signature + stamp */}
          <div className="relative bg-background px-4 py-4 sm:px-5">
            <p className="font-mono text-[9px] tracking-[0.22em] text-muted-foreground/80 uppercase">
              Approved by
            </p>
            <p className="mt-1 -rotate-2 font-signature text-4xl leading-tight text-foreground sm:text-5xl">
              Hieu Le
            </p>
            <span
              aria-hidden="true"
              className="absolute top-1/2 right-5 hidden -translate-y-1/2 rotate-[-9deg] border-2 border-accent-stamp/80 px-3 py-1.5 font-mono text-[11px] tracking-[0.3em] text-accent-stamp uppercase sm:inline-block"
            >
              Approved
            </span>
          </div>

          {/* contact cell */}
          <div className="bg-background px-4 py-4 sm:px-5">
            <p className="font-mono text-[9px] tracking-[0.22em] text-muted-foreground/80 uppercase">
              Contact
            </p>
            <div className="mt-2 space-y-1 font-mono text-xs text-muted-foreground">
              <p>
                <a
                  href={`mailto:${contact.email}`}
                  className="transition-colors hover:text-accent-brand"
                >
                  {contact.email}
                </a>
              </p>
              <p>
                <a href={contact.phoneHref} className="transition-colors hover:text-accent-brand">
                  {contact.phone}
                </a>
              </p>
            </div>
            <div className="mt-3 flex items-center gap-5">
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
          </div>
        </div>
      </motion.div>

      <p className="mt-10 font-mono text-[10px] tracking-[0.14em] text-muted-foreground/70 uppercase">
        © 2026 Hieu Le · DWG NO. LTH-2026-01 · Type set in Space Grotesk &amp; Geist Mono
      </p>
    </section>
  )
}
