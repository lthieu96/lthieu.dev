'use client'

import { motion } from 'motion/react'
import { SectionLabel } from '@/components/section-label'
import { education, type ExperienceRole, experienceRoles, sideProjects } from '@/data/resume'

const EASE = [0.22, 1, 0.36, 1] as const

function RoleRow({ role, index }: { role: ExperienceRole; index: number }) {
  return (
    <motion.article
      className="grid gap-y-3 border-t border-[color:var(--layout-line)] py-8 md:grid-cols-[200px_minmax(0,1fr)] md:gap-x-12 sm:py-10"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.04 }}
    >
      <div className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase md:pt-2">
        {role.period}
        {role.current ? (
          <span className="mt-2 hidden w-fit items-center gap-1.5 text-accent-brand md:flex">
            <span className="size-1.5 rounded-full bg-accent-brand" />
            Now
          </span>
        ) : null}
      </div>

      <div className="min-w-0">
        <h3 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
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
              className="rounded-full border border-[color:var(--layout-line)] px-3 py-1 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  )
}

export function ExperienceEditorial() {
  return (
    <section className="container-editorial page-gutter py-20 sm:py-28">
      <SectionLabel index="03" title="Experience" />

      <div className="mt-10">
        {experienceRoles.map((role, index) => (
          <RoleRow key={role.id} role={role} index={index} />
        ))}
      </div>

      <div className="mt-16">
        <SectionLabel index="04" title="Projects & education" />

        <div className="mt-10">
          {sideProjects.map((project, index) => (
            <RoleRow key={project.id} role={project} index={index} />
          ))}

          <motion.article
            className="grid gap-y-3 border-t border-b border-[color:var(--layout-line)] py-8 md:grid-cols-[200px_minmax(0,1fr)] md:gap-x-12 sm:py-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-8%' }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <div className="font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase md:pt-2">
              {education.period}
            </div>
            <div>
              <h3 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
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
