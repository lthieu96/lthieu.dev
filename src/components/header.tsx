import { PageFrame } from './page-frame'
import { ThemeSwitch } from './theme-switch'

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
      <ThemeSwitch />
    </PageFrame>
  )
}
