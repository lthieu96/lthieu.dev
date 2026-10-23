import { Link, type LinkProps } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import type { ComponentProps, CSSProperties, ReactNode } from 'react'
import { ThemeToggle } from './theme-toggle'

/** Stagger index for the `.enter` animation. */
export const delay = (i: number) => ({ '--i': i }) as CSSProperties

/** The 600px reading column every page sits in. */
export function Page({ className = '', ...props }: ComponentProps<'main'>) {
  return <main {...props} className={`mx-auto w-full max-w-[640px] px-5 pt-14 ${className}`} />
}

/** The small signature in the top bar. The footer's is animated: see signature.tsx. */
export function Signature() {
  return (
    <span className="font-hand text-[34px] leading-none whitespace-nowrap text-subtle">HieuLe</span>
  )
}

/** A link's trailing arrow. It nudges the way it points while its link (a `group`) is hovered. */
export function Arrow({ dir }: { dir: '↗' | '→' }) {
  return (
    <span
      aria-hidden
      className={`inline-block transition-transform duration-150 ease-(--ease-out) ${dir === '↗' ? 'group-hover:translate-x-px group-hover:-translate-y-px' : 'group-hover:translate-x-0.5'}`}
    >
      {dir}
    </span>
  )
}

/** Back link on the left, signature on the right. Used on every page except home. */
export function TopBar({ back, label }: { back: LinkProps['to']; label: string }) {
  return (
    <nav className="enter flex items-center justify-between" style={delay(0)}>
      <Link
        to={back}
        className="group flex items-center gap-1.5 text-ui text-muted transition-colors duration-150 hover:text-fg"
      >
        <ArrowLeft
          size={14}
          aria-hidden
          className="transition-transform duration-150 ease-(--ease-out) group-hover:-translate-x-0.5"
        />
        {label}
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Link to="/" aria-label="Home">
          <Signature />
        </Link>
      </div>
    </nav>
  )
}

/** Small grey heading over a list, like "Selected work". */
export function Section({
  title,
  aside,
  children,
  i,
  id,
}: {
  title: string
  aside?: ReactNode
  children: ReactNode
  i: number
  id?: string
}) {
  return (
    <section id={id} className="enter scroll-mt-14" style={delay(i)}>
      <div className="flex items-center justify-between">
        <h2 className="text-ui font-medium text-subtle">{title}</h2>
        {aside}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

/** Title in white, one line of description in grey, something small on the right. */
export function ListRow({
  title,
  description,
  aside,
}: {
  title: ReactNode
  description: ReactNode
  aside?: ReactNode
}) {
  return (
    // items-baseline: the aside sits on the title's baseline, not the top of the box.
    <div className="flex items-baseline justify-between gap-6">
      <div className="min-w-0">
        <div className="text-list text-fg">{title}</div>
        <p className="text-ui text-muted">{description}</p>
      </div>
      {aside && <div className="shrink-0 text-ui text-subtle tabular-nums">{aside}</div>}
    </div>
  )
}
