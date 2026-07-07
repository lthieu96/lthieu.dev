'use client'

import { motion } from 'motion/react'
import { SectionLabel } from '@/components/section-label'
import { education, type ExperienceRole, experienceRoles, sideProjects } from '@/data/resume'

const EASE = [0.22, 1, 0.36, 1] as const

function TableHead() {
  return (
    <div className="hidden grid-cols-[72px_170px_minmax(0,1fr)] gap-x-10 border-b border-[color:var(--layout-line)] pb-2.5 font-mono text-[10px] tracking-[0.22em] text-muted-foreground/80 uppercase md:grid">
      <span>Rev</span>
      <span>Period</span>
      <span>Description of change</span>
    </div>
  )
}

function RoleRow({ role, index, rev }: { role: ExperienceRole; index: number; rev: string }) {
  return (
    <motion.article
      className="grid gap-y-3 border-t border-[color:var(--layout-line)] py-8 first:border-t-0 md:grid-cols-[72px_170px_minmax(0,1fr)] md:gap-x-10 sm:py-10"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.04 }}
    >
      <div className="flex items-start gap-3 md:block">
        <span className="inline-flex min-w-9 items-center justify-center border border-[color:var(--layout-line)] px-2 py-1.5 font-mono text-xs tracking-[0.1em] text-accent-brand uppercase">
          {rev}
        </span>
        {role.current ? (
          <span className="inline-flex rotate-[-4deg] items-center border border-accent-stamp/70 px-2 py-1 font-mono text-[9px] tracking-[0.2em] text-accent-stamp uppercase md:mt-3 md:block md:w-fit">
            Current
          </span>
        ) : null}
      </div>

      <div className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase md:pt-1.5">
        {role.period}
      </div>

      <div className="min-w-0">
        <h3 className="font-display text-2xl leading-tight font-bold text-foreground sm:text-3xl">
          {role.role}
        </h3>
        <p className="mt-1.5 font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">
          {role.companyUrl ? (
            <a
              href={role.companyUrl}
              target="_blank"
              rel="noreferrer"
              className="text-foreground transition-colors hover:text-accent-brand"
            >
              {role.company}
            </a>
          ) : (
            <span className="text-foreground">{role.company}</span>
          )}
          {role.type ? ` · ${role.type}` : null}
        </p>

        <ul className="mt-5 space-y-2">
          {role.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-3 text-sm leading-7 text-muted-foreground">
              <span aria-hidden="true" className="select-none text-accent-brand">
                —
              </span>
              {bullet}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap gap-2">
          {role.skills.map((skill) => (
            <span
              key={skill}
              className="border border-[color:var(--layout-line)] px-2.5 py-1 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  )
}

export function ExperienceTechnical() {
  const total = experienceRoles.length

  return (
    <section className="container-editorial page-gutter py-20 sm:py-28">
      <SectionLabel index="03" title="Revision history" />

      <div className="mt-10">
        <TableHead />
        {experienceRoles.map((role, index) => (
          <RoleRow
            key={role.id}
            role={role}
            index={index}
            // drawings revise A → B → C, so the newest role carries the highest letter
            rev={String.fromCharCode(65 + (total - 1 - index))}
          />
        ))}
      </div>

      <div className="mt-16">
        <SectionLabel index="04" title="Detail drawings — Projects & education" />

        <div className="mt-10">
          {sideProjects.map((project, index) => (
            <RoleRow key={project.id} role={project} index={index} rev={`D${index + 1}`} />
          ))}

          <motion.article
            className="grid gap-y-3 border-t border-b border-[color:var(--layout-line)] py-8 md:grid-cols-[72px_170px_minmax(0,1fr)] md:gap-x-10 sm:py-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-8%' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div>
              <span className="inline-flex min-w-9 items-center justify-center border border-[color:var(--layout-line)] px-2 py-1.5 font-mono text-xs tracking-[0.1em] text-accent-brand uppercase">
                EDU
              </span>
            </div>
            <div className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase md:pt-1.5">
              {education.period}
            </div>
            <div>
              <h3 className="font-display text-2xl leading-tight font-bold text-foreground sm:text-3xl">
                {education.school}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                B.E. in {education.major} — graduated{' '}
                <span className="text-foreground">{education.classification}</span>.
              </p>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  )
}
