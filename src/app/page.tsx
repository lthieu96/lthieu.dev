import { AvatarCard } from '@/components/avatar-card'
import { DividerSlash } from '@/components/divider-slash'
import { InformationSection } from '@/components/information-section'
import { Section } from '@/components/section'
import { TextFlip } from '@/components/text-flip/text-flip'

export default function Home() {
  return (
    <>
      <Section>
        <div className="grid grid-cols-[150px_minmax(0,1fr)] content-start items-start">
          <AvatarCard />

          <div className="default-border-text-color flex min-h-full w-full flex-col justify-end border-l border-current pl-3 pt-1">
            <div className="flex items-baseline gap-1">
              <h1 className="font-serif text-[30px] leading-none font-medium text-foreground">
                Hieu Le
              </h1>
              <div className="w-8 h-[1px] bg-black/15 dark:bg-white/[0.18]" />
            </div>
            <div className="mt-0.5 mb-2 h-6 w-full overflow-hidden">
              <TextFlip className="w-full text-sm leading-6 text-muted-foreground" interval={2.8}>
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
    </>
  )
}
