import { createFileRoute } from '@tanstack/react-router'
import { caseStudies } from '@/data/projects'
import { site } from '@/data/site'

// Built from the data rather than the crawler, which also lists hash links and trailing-slash twins.
export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () => {
        const paths = ['/', '/resume', ...caseStudies.map((p) => `/work/${p.slug}`)]
        const urls = paths.map((p) => `<url><loc>${site.url}${p}</loc></url>`).join('')
        const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
        return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } })
      },
    },
  },
})
