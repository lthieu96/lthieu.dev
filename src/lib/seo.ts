import { site } from '@/data/site'

/** Title, description and the matching Open Graph / Twitter tags for a route's `head()`. */
export function seo({
  title,
  description = site.description,
}: {
  title?: string
  description?: string
}) {
  const fullTitle = title ? `${title} · ${site.name}` : `${site.name} · ${site.role}`
  return [
    { title: fullTitle },
    { name: 'description', content: description },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: site.name },
    { name: 'twitter:card', content: 'summary' },
  ]
}
