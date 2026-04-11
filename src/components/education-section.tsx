'use client'

import { GraduationHat01 } from '@untitledui/icons'
import { Section } from '@/components/section'

export function EducationSection() {
  return (
    <Section>
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Education
        </p>

        <div className="mt-6 border-t border-[color:var(--layout-line)] pt-5">
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-muted-foreground/15 bg-muted text-muted-foreground ring-1 ring-border ring-offset-1 ring-offset-background">
              <GraduationHat01 className="size-4" strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
              <h3 className="font-serif text-xl leading-snug text-foreground">
                University of Information Technology - VNUHCM
              </h3>
              <p className="mt-1 font-mono text-xs text-muted-foreground sm:text-sm">
                08.2019 — 05.2025
              </p>

              <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                <div>
                  <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                    Major
                  </p>
                  <p className="mt-1 text-sm leading-6 text-foreground">Software Engineering</p>
                </div>

                <div>
                  <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                    GPA
                  </p>
                  <p className="mt-1 text-sm leading-6 text-foreground">3.28 / 4.0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
