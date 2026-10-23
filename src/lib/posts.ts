// Post data goes through static server functions so the MDX bodies stay out of the client bundle:
// at build time each call is cached as JSON next to the prerendered HTML.
import { createServerFn } from '@tanstack/react-start'
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions'
import { allPosts } from 'content-collections'

const sorted = () => [...allPosts].sort((a, b) => a.order - b.order)

const toSummary = (p: (typeof allPosts)[number]) => ({
  slug: p.slug,
  title: p.title,
  summary: p.summary,
  tag: p.tag,
  draft: p.draft,
  featured: p.featured,
  hasBody: p.hasBody,
})

export type PostSummary = ReturnType<typeof toSummary>

export const getPostList = createServerFn({ method: 'GET' })
  .middleware([staticFunctionMiddleware])
  .handler(() => sorted().map(toSummary))

export const getPost = createServerFn({ method: 'GET' })
  .validator((slug: string) => slug)
  .middleware([staticFunctionMiddleware])
  .handler(({ data: slug }) => {
    const published = sorted().filter((p) => p.hasBody)
    const i = published.findIndex((p) => p.slug === slug)
    if (i === -1) return null
    const post = published[i]
    const link = (p?: (typeof published)[number]) => (p ? { slug: p.slug, title: p.title } : null)
    return {
      ...toSummary(post),
      readingMinutes: post.readingMinutes,
      mdx: post.mdx,
      prev: link(published[i - 1]),
      next: link(published[i + 1]),
    }
  })
