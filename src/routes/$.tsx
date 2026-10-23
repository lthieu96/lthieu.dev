import { createFileRoute, Link, type LinkProps, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import { delay, Page } from '@/components/layout'
import { PageDither } from '@/components/shaders/dither-field'
import { restoreMissedUrl } from '@/lib/missed-url'
import { seo } from '@/lib/seo'

// Catch-all. Prerendered at /404 into 404.html, which the static host serves for unknown URLs;
// the client then matches this same route, so hydration lines up.
export const Route = createFileRoute('/$')({
  head: () => ({ meta: [...seo({ title: 'Not found' }), { name: 'robots', content: 'noindex' }] }),
  component: NotFound,
})

const destinations: { to: LinkProps['to']; hash?: string; label: string; hint: string }[] = [
  { to: '/', label: 'Home', hint: "Who I am and what I'm building" },
  { to: '/', hash: 'work', label: 'Work', hint: 'Sway, Cerebro, BenKon and more' },
]

export function NotFound() {
  useEffect(restoreMissedUrl, [])
  const { pathname } = useLocation()

  return (
    <>
      <PageDither />
      <Page className="flex min-h-svh flex-col justify-center pb-24" data-rendered-at={pathname}>
        <p className="enter font-mono text-meta text-muted" style={delay(0)}>
          404
        </p>
        <h1 className="enter mt-3 text-h1 font-medium text-fg" style={delay(1)}>
          This page closed before it opened.
        </h1>
        <p className="enter mt-3 text-body text-muted" style={delay(2)}>
          The link might be old, or I moved things around. Here's where you can go instead:
        </p>
        <ul className="enter mt-7" style={delay(3)}>
          {destinations.map((d) => (
            <li key={d.label} className="border-line border-t">
              <Link
                to={d.to}
                hash={d.hash}
                className="group flex justify-between gap-6 py-3 text-list text-fg"
              >
                <span>
                  {d.label}{' '}
                  <span className="inline-block transition-transform duration-150 ease-(--ease-out) group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
                <span className="text-ui text-subtle">{d.hint}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Page>
    </>
  )
}
