'use client'

import { differenceInMonths, parse } from 'date-fns'
import { BriefcaseBusinessIcon, InfinityIcon } from 'lucide-react'
import { type ComponentProps, useCallback, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

import type { ChevronsUpDownIconHandle } from '@/components/chevrons-up-down-icon/chevrons-up-down-icon'
import { ChevronsUpDownIcon } from '@/components/chevrons-up-down-icon/chevrons-up-down-icon'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export type ExperiencePositionItemType = {
  /** Unique identifier for the position */
  id: string
  /** The job title or position name */
  title: string
  /**
   * Employment period of the position.
   * Use "MM.YYYY" or "YYYY" format. Omit `end` for current roles.
   */
  employmentPeriod?: {
    /** Start date (e.g., "10.2022" or "2020"). */
    start: string
    /** End date; leave undefined for "Present". */
    end?: string
  }
  /** The type of employment (e.g., "Full-time", "Part-time", "Contract") */
  employmentType?: string
  /** A brief description of the position or responsibilities */
  description?: string
  /** An icon representing the position */
  icon?: React.ReactElement
  /** A list of skills associated with the position */
  skills?: string[]
  /** Indicates if the position details are expanded in the UI */
  isExpanded?: boolean
}

export type ExperienceItemType = {
  /** Unique identifier for the experience item */
  id: string
  /** Name of the company where the experience was gained */
  companyName: string
  /** URL or path to the company's logo image */
  companyLogo?: string
  /** URL to the company's website. */
  companyWebsite?: string
  /**
   * List of positions held at the company
   * @fumadocsHref #experiencepositionitemtype
   * */
  positions: ExperiencePositionItemType[]
  /** Indicates if this is the user's current employer */
  isCurrentEmployer?: boolean
}

export type WorkExperienceProps = {
  className?: string
  /** @fumadocsHref #experienceitemtype */
  experiences: ExperienceItemType[]
}

export function WorkExperience({ className, experiences }: WorkExperienceProps) {
  return (
    <div className={cn('text-foreground', className)}>
      {experiences.map((experience) => (
        <ExperienceItem key={experience.id} experience={experience} />
      ))}
    </div>
  )
}

export type ExperienceItemProps = {
  experience: ExperienceItemType
}

export function ExperienceItem({ experience }: ExperienceItemProps) {
  return (
    <div className="space-y-4 py-5 first:pt-0">
      <div className="not-prose flex items-center gap-3">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted/50">
          {experience.companyLogo ? (
            <img
              src={experience.companyLogo}
              alt={experience.companyName}
              className="size-6 rounded-full"
              aria-hidden
            />
          ) : (
            <span className="flex size-2 rounded-full bg-[color:var(--layout-line)]" />
          )}
        </div>

        <h3 className="font-serif text-xl leading-snug text-foreground">
          {experience.companyWebsite ? (
            <a
              className="underline-offset-4 decoration-1 hover:underline"
              href={experience.companyWebsite}
              target="_blank"
              rel="noopener noreferrer"
            >
              {experience.companyName}
            </a>
          ) : (
            experience.companyName
          )}
        </h3>

        {experience.isCurrentEmployer && (
          <span className="rounded-full border border-[color:var(--layout-line)] px-2 py-0.5 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
            Current
          </span>
        )}
      </div>

      <div className="relative space-y-4 before:absolute before:left-3 before:h-full before:w-px before:bg-[color:var(--layout-line)]/70">
        {experience.positions.map((position) => (
          <ExperiencePositionItem key={position.id} position={position} />
        ))}
      </div>
    </div>
  )
}

export type ExperiencePositionItemProps = {
  position: ExperiencePositionItemType
}

export function ExperiencePositionItem({ position }: ExperiencePositionItemProps) {
  const chevronsIconRef = useRef<ChevronsUpDownIconHandle>(null)

  const handleOpenChange = useCallback((open: boolean) => {
    const controls = chevronsIconRef.current
    if (!controls) return

    if (open) {
      controls.startAnimation()
    } else {
      controls.stopAnimation()
    }
  }, [])

  const start = position.employmentPeriod?.start
  const end = position.employmentPeriod?.end
  const hasEmploymentPeriod = Boolean(start)
  const isOngoing = hasEmploymentPeriod && !end
  const duration = hasEmploymentPeriod && start ? formatDuration(start, end) : ''
  const hasMeta = Boolean(position.employmentType || hasEmploymentPeriod || duration)

  return (
    <Collapsible
      defaultOpen={position.isExpanded}
      onOpenChange={handleOpenChange}
      disabled={!position.description}
      asChild
    >
      <div className="relative last:before:absolute last:before:h-full last:before:w-4 last:before:bg-transparent">
        <CollapsibleTrigger
          className={cn(
            'group/experience-position not-prose block w-full text-left select-none data-[disabled=false]:cursor-pointer',
            'relative before:absolute before:-top-1 before:-right-1 before:-bottom-1 before:left-7 before:rounded-lg before:bg-transparent before:opacity-0 before:transition-[background-color,opacity] before:duration-200 before:ease-out hover:before:opacity-100 hover:before:bg-black/[0.035] dark:hover:before:bg-white/[0.04]',
            'data-disabled:before:content-none',
          )}
        >
          <div className={cn('relative z-1 flex items-center gap-3', hasMeta && 'mb-0')}>
            <div
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-md',
                'bg-muted text-muted-foreground',
                'border border-muted-foreground/15 ring-1 ring-border ring-offset-1 ring-offset-background',
                "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              )}
            >
              {position.icon ?? <BriefcaseBusinessIcon />}
            </div>

            <h4 className="flex-1 text-sm font-medium text-balance text-foreground sm:text-base">
              {position.title}
            </h4>

            <div className="shrink-0 text-muted-foreground group-disabled/experience-position:hidden [&_svg]:size-4">
              <ChevronsUpDownIcon ref={chevronsIconRef} duration={0.15} />
            </div>
          </div>

          {hasMeta && (
            <div className="relative z-1 flex flex-wrap items-center gap-x-2 gap-y-1 pl-9 font-mono text-xs text-muted-foreground sm:text-sm">
              {position.employmentType && (
                <>
                  <dl>
                    <dt className="sr-only">Employment Type</dt>
                    <dd>{position.employmentType}</dd>
                  </dl>

                  {hasEmploymentPeriod || duration ? (
                    <Separator
                      className="data-vertical:h-4 data-vertical:self-center"
                      orientation="vertical"
                    />
                  ) : null}
                </>
              )}

              {hasEmploymentPeriod ? (
                <dl>
                  <dt className="sr-only">Employment Period</dt>
                  <dd className="flex items-center gap-0.5 tabular-nums">
                    <span>{start}</span>
                    <span className="font-mono">—</span>
                    {isOngoing ? (
                      <>
                        <InfinityIcon className="size-4.5 translate-y-[0.5px]" />
                        <span className="sr-only">Present</span>
                      </>
                    ) : (
                      <span>{end}</span>
                    )}
                  </dd>
                </dl>
              ) : null}

              {duration && (
                <>
                  {hasEmploymentPeriod ? (
                    <Separator
                      className="data-vertical:h-4 data-vertical:self-center"
                      orientation="vertical"
                    />
                  ) : null}

                  <dl>
                    <dt className="sr-only">Duration</dt>
                    <dd className="tabular-nums">{duration}</dd>
                  </dl>
                </>
              )}
            </div>
          )}
        </CollapsibleTrigger>

        <CollapsibleContent className="overflow-hidden transition-opacity duration-200 ease-out data-[state=closed]:animate-collapsible-up data-[state=closed]:opacity-0 data-[state=open]:animate-collapsible-down data-[state=open]:opacity-100">
          {position.description && (
            <div>
              <Prose className="pt-2 pl-9">
                <ReactMarkdown>{position.description}</ReactMarkdown>
              </Prose>
            </div>
          )}
        </CollapsibleContent>

        {Array.isArray(position.skills) && position.skills.length > 0 && (
          <ul className={cn('not-prose flex flex-wrap gap-1.5 pl-9', hasMeta ? 'pt-3' : 'pt-2')}>
            {position.skills.map((skill, index) => (
              <li key={index} className="flex">
                <Skill>{skill}</Skill>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Collapsible>
  )
}

function Prose({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none font-mono text-foreground prose-zinc dark:prose-invert prose-p:leading-6 prose-p:text-muted-foreground prose-li:leading-6 prose-li:text-muted-foreground prose-strong:font-medium prose-strong:text-foreground',
        className,
      )}
      {...props}
    />
  )
}

function Skill({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-[color:var(--layout-line)] bg-muted/40 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground',
        className,
      )}
      {...props}
    />
  )
}

function formatDuration(start: string, end?: string): string {
  const startHasMonth = start.includes('.')
  const endHasMonth = end ? end.includes('.') : true

  // Both year-only: granularity is years, no month arithmetic needed.
  if (!startHasMonth && end && !endHasMonth) {
    const years = parseInt(end, 10) - parseInt(start, 10)
    if (years <= 0) {
      return ''
    }
    return `${years}y`
  }

  const startDate = parsePeriodDate(start, 'first')
  const endDate = end ? parsePeriodDate(end, 'last') : new Date()

  // +1 to count both the start and end months inclusively.
  const totalMonths = differenceInMonths(endDate, startDate) + 1
  if (totalMonths <= 0) {
    return ''
  }

  if (totalMonths < 12) {
    return `${totalMonths}m`
  }

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  if (months === 0) {
    return `${years}y`
  }
  return `${years}y ${months}m`
}

function parsePeriodDate(str: string, fallbackMonth: 'first' | 'last'): Date {
  if (str.includes('.')) {
    return parse(str, 'MM.yyyy', new Date())
  }
  return parse(`${fallbackMonth === 'last' ? '12' : '01'}.${str}`, 'MM.yyyy', new Date())
}
