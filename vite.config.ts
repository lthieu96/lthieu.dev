import { execSync } from 'node:child_process'
import contentCollections from '@content-collections/vite'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const commit = (() => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'dev'
  }
})()

export default defineConfig({
  resolve: { tsconfigPaths: true },
  define: {
    __BUILD_COMMIT__: JSON.stringify(commit),
  },
  plugins: [
    contentCollections(),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: true,
        // shortcut: crawler treats `/#work` as its own page (TanStack/router#8516); drop when fixed
        // The crawler also follows /resume.pdf and rewrites it as text, which corrupts the binary.
        filter: ({ path }) => !path.includes('#') && !path.endsWith('.pdf'),
      },
      pages: [
        { path: '/sitemap.xml', prerender: { enabled: true, outputPath: '/sitemap.xml' } },
        { path: '/404', prerender: { enabled: true, outputPath: '/404.html' } },
      ],
      // Our own src/routes/sitemap[.]xml.ts instead; see the note there.
      sitemap: { enabled: false, outputPath: 'sitemap.xml' },
    }),
    viteReact(),
  ],
})
