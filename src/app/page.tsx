import { AboutSection } from '@/components/about-section'
import { AvatarCard } from '@/components/avatar-card'
import { DividerSlash } from '@/components/divider-slash'
import { EducationSection } from '@/components/education-section'
import { ExperienceSection } from '@/components/experience-section'
import { InformationSection } from '@/components/information-section'
import { Section } from '@/components/section'
import { TextFlip } from '@/components/text-flip/text-flip'

export default function Home() {
  return (
    <>
      <Section>
        <div className="grid grid-cols-[118px_minmax(0,1fr)] content-start items-start sm:grid-cols-[150px_minmax(0,1fr)]">
          <div className="max-w-[118px] sm:max-w-[150px]">
            <AvatarCard />
          </div>

          <div className="default-border-text-color flex min-h-full w-full flex-col justify-end border-l border-current pl-3 pt-1">
            <div className="flex items-baseline gap-1">
              <h1 className="font-serif text-[30px] leading-none font-medium text-foreground">
                Hieu Le
              </h1>
              <div className="h-[1px] w-8 bg-[color:var(--layout-line)]" />
            </div>
            <div className="mt-0.5 mb-1 h-5 w-full overflow-hidden sm:mb-2 sm:h-6">
              <TextFlip
                className="w-full text-[12px] leading-5 text-muted-foreground sm:text-sm sm:leading-6"
                interval={2.8}
              >
                <span>Fullstack Developer</span>
                <span>Building Web Applications</span>
                <span>Portfolio Systems at Scale</span>
                <span>Admin Tools &amp; Dashboards</span>
              </TextFlip>
            </div>
          </div>
        </div>
      </Section>
      <DividerSlash />
      <InformationSection />
      <DividerSlash />
      <AboutSection />
      <DividerSlash />
      <ExperienceSection />
      <DividerSlash />
      <EducationSection />
    </>
  )
}
