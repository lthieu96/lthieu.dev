import { Download01 } from '@untitledui/icons'
import { PageFrame } from './page-frame'
import { ThemeSwitch } from './theme-switch'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <PageFrame
      as="header"
      className="border-b border-[color:var(--layout-line)]"
      leftClassName="border-r border-[color:var(--layout-line)]"
      midLeftClassName="border-r border-[color:var(--layout-line)]"
      contentClassName="flex items-center justify-between px-4 sm:px-6 h-14"
      midRightClassName="border-l border-[color:var(--layout-line)]"
      rightClassName="border-l border-[color:var(--layout-line)]"
    >
      <span className="font-mono text-sm font-medium tracking-tight text-foreground">
        lthieu.dev
      </span>
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="text-foreground/70 hover:text-foreground"
        >
          <a href="/resume.pdf" download="hieu-le-resume.pdf" aria-label="Download resume">
            <Download01 className="size-4" strokeWidth={1.8} />
            <span className="hidden sm:inline">Resume</span>
          </a>
        </Button>
        <ThemeSwitch />
      </div>
    </PageFrame>
  )
}
