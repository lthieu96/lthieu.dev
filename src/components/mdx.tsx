import { type ComponentProps, useRef } from 'react'
import { CopyButton } from '@/components/copy-button'
import { external } from '@/lib/external'

/**
 * Wraps rehype-pretty-code's <figure>: filename header with a copy button, then the code.
 * The title comes from the fence meta, e.g. ```ts title="budget.ts".
 */
function CodeFigure({ children, ...props }: ComponentProps<'figure'>) {
  const ref = useRef<HTMLElement>(null)

  if (!('data-rehype-pretty-code-figure' in props)) return <figure {...props}>{children}</figure>

  return (
    <figure
      {...props}
      ref={ref}
      className="group/code relative my-6 overflow-hidden rounded-[10px] border border-line bg-well [&>figcaption]:border-line [&>figcaption]:border-b [&>figcaption]:px-4 [&>figcaption]:py-2.5 [&>figcaption]:font-mono [&>figcaption]:text-meta [&>figcaption]:text-subtle"
    >
      {children}
      <CopyButton
        text={() => ref.current?.querySelector('pre')?.textContent ?? ''}
        label="Copy code"
        className="absolute top-1.5 right-2 grid size-7 rounded-md"
      />
    </figure>
  )
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="my-5 border-line border-l-2 py-1 pl-4 font-serif text-quote text-fg italic">
      {children}
    </blockquote>
  )
}

export const mdxComponents = {
  figure: CodeFigure,
  Callout,
  h2: (p: ComponentProps<'h2'>) => <h2 className="mt-12 mb-4 text-h2 font-medium text-fg" {...p} />,
  p: (p: ComponentProps<'p'>) => <p className="my-5 text-body text-prose" {...p} />,
  a: (p: ComponentProps<'a'>) => (
    <a
      className="text-fg underline decoration-fg/30 underline-offset-[3px] hover:decoration-fg"
      {...external(p.href ?? '')}
      {...p}
    />
  ),
  ul: (p: ComponentProps<'ul'>) => (
    <ul className="my-5 list-disc pl-5 text-body text-prose marker:text-subtle" {...p} />
  ),
  ol: (p: ComponentProps<'ol'>) => (
    <ol className="my-5 list-decimal pl-5 text-body text-prose marker:text-subtle" {...p} />
  ),
}
