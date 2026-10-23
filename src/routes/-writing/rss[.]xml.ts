import { createFileRoute } from '@tanstack/react-router'
import { allPosts } from 'content-collections'
import { site } from '@/data/site'

const xml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Prerendered to /rss.xml. Only posts with a body; drafts included, they're public pages too.
export const Route = createFileRoute('/rss.xml')({
  server: {
    handlers: {
      GET: () => {
        const items = allPosts
          .filter((p) => p.hasBody)
          .sort((a, b) => a.order - b.order)
          .map((p) => {
            const url = `${site.url}/writing/${p.slug}`
            const date = p.date ? `<pubDate>${p.date.toUTCString()}</pubDate>` : ''
            return `<item><title>${xml(p.title)}</title><link>${url}</link><guid>${url}</guid><description>${xml(p.summary)}</description>${date}</item>`
          })
          .join('')
        const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(site.name)} · Writing</title><link>${site.url}/writing</link><description>${xml(site.description)}</description>${items}</channel></rss>`
        return new Response(body, {
          headers: { 'content-type': 'application/rss+xml; charset=utf-8' },
        })
      },
    },
  },
})
