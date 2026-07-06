import { Download01 } from '@untitledui/icons'
import { ThemeSwitch } from './theme-switch'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[color:var(--layout-line)] bg-background/70 backdrop-blur-md">
      <div className="container-editorial page-gutter flex h-14 items-center justify-between">
        <a href="#top" className="font-display text-lg leading-none text-foreground">
          hieu<span className="text-accent-brand">.</span>le
        </a>

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
      </div>
    </header>
  )
}
