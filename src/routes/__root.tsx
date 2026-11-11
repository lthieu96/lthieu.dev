import geist from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url'
import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
import type { ReactNode } from 'react'
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
  component: Outlet,
  notFoundComponent: NotFound,
})

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
