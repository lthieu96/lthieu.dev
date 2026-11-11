import geist from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url'
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import { type ReactNode, useEffect, useLayoutEffect, useRef } from 'react'
import { seo } from '@/lib/seo'
import { DEFAULT_THEME, themeScript } from '@/lib/theme'
import appCss from '@/styles/app.css?url'
import { NotFound } from './$'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ...seo({}),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      // The body font, fetched alongside the CSS instead of after it: on 3G that was a second
      // late, and the text reflowed when it swapped in.
      { rel: 'preload', href: geist, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  shellComponent: Document,
  component: Root,
  notFoundComponent: NotFound,
})

/**
 * Back and Forward return to a page already seen, often scrolled halfway down: its blocks are
 * simply there under the crossfade instead of rising one by one again (.enter in app.css).
 */
function Root() {
  const router = useRouter()
  // Changes in the same commit that mounts the new page, so the layout effect below sees it.
  const page = useRouterState({ select: (s) => s.matches.at(-1)?.id })
  const traversal = useRef(false)
  useEffect(
    () =>
      router.history.subscribe(({ action }) => {
        traversal.current =
          action.type === 'BACK' || action.type === 'FORWARD' || action.type === 'GO'
      }),
    [router],
  )
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once per page, after it mounts
  useLayoutEffect(() => {
    if (!traversal.current) return
    for (const a of document.getAnimations()) {
      // Finished, not removed: a finished CSS animation stays put when the next push re-renders.
      if (a instanceof CSSAnimation && a.animationName === 'enter') a.finish()
    }
  }, [page])
  return <Outlet />
}

function Document({ children }: { children: ReactNode }) {
  return (
    // The theme script sets data-theme before React hydrates.
    <html lang="en" data-theme={DEFAULT_THEME} suppressHydrationWarning>
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static string, must run before paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
