import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
import rehypePrettyCode from 'rehype-pretty-code'
import { z } from 'zod'
import { codeThemes } from './src/lib/code-theme'

const WORDS_PER_MINUTE = 220

const posts = defineCollection({
  name: 'posts',
  directory: 'content/posts',
  include: '*.mdx',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    tag: z.enum(['Backend', 'Frontend', 'Mobile', 'Side project']),
    // Drafts show up in lists; posts without a body are listed but not linked.
    draft: z.boolean().default(false),
    /** Shown in the Writing section on the home page. */
    featured: z.boolean().default(false),
    date: z.coerce.date().optional(),
    // Lower comes first in lists.
    order: z.number().default(100),
    content: z.string(),
  }),
  transform: async (doc, ctx) => {
    const hasBody = doc.content.trim().length > 0
    const words = doc.content.split(/\s+/).filter(Boolean).length
    return {
      ...doc,
      slug: doc._meta.path,
      hasBody,
      readingMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
      mdx: hasBody
        ? await compileMDX(ctx, doc, {
            rehypePlugins: [[rehypePrettyCode, { theme: codeThemes, keepBackground: false }]],
          })
        : '',
    }
  },
})

export default defineConfig({ content: [posts] })
