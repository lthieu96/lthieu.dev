import { Download01 } from '@untitledui/icons'
import { CursorCoords } from './cursor-coords'
import { ThemeSwitch } from './theme-switch'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[color:var(--layout-line)] bg-background/70 backdrop-blur-md">
      <div className="container-editorial page-gutter flex h-14 items-center justify-between">
        <div className="flex min-w-0 items-baseline gap-4">
          <a
            href="#top"
            className="font-display text-lg leading-none font-bold tracking-tight text-foreground uppercase"
          >
            Hieu<span className="text-accent-brand">.</span>Le
          </a>
          <span className="hidden font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase md:inline">
            DWG NO. LTH-2026-01 · Sheet 1/1
          </span>
        </div>

        <div className="flex items-center gap-4">
          <CursorCoords />
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="font-mono text-xs tracking-[0.08em] text-foreground/70 uppercase hover:text-foreground"
            >
              <a href="/resume.pdf" download="hieu-le-resume.pdf" aria-label="Download resume">
                <Download01 className="size-4" strokeWidth={1.8} />
                <span className="hidden sm:inline">Resume</span>
              </a>
            </Button>
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </header>
  )
}
