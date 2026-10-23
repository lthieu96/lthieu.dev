import { MDXContent } from '@content-collections/mdx/react'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { delay, Page, TopBar } from '@/components/layout'
import { mdxComponents } from '@/components/mdx'
import { getPost } from '@/lib/posts'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/writing/$slug')({
  loader: async ({ params }) => {
    const post = await getPost({ data: params.slug })
    if (!post) throw notFound()
    return post
  },
  head: ({ loaderData }) => ({
    meta: seo({ title: loaderData?.title, description: loaderData?.summary }),
  }),
  component: Post,
})

function Post() {
  const post = Route.useLoaderData()

  return (
    <Page className="pb-24">
      <TopBar back="/writing" label="Writing" />
      <article>
        <header className="enter mt-20" style={delay(1)}>
          <h1 className="text-h1 font-medium text-fg">{post.title}</h1>
          <p className="mt-3.5 text-ui whitespace-pre text-subtle">
            {[post.draft && 'Draft', `${post.readingMinutes} min read`, post.tag]
              .filter(Boolean)
              .join('  ·  ')}
          </p>
        </header>
        <div className="enter mt-7" style={delay(2)}>
          <MDXContent code={post.mdx} components={mdxComponents} />
        </div>
      </article>

      {(post.prev || post.next) && (
        <nav className="mt-16 flex justify-between gap-6 border-line border-t pt-6">
          {post.prev ? (
            <Link
              to="/writing/$slug"
              params={{ slug: post.prev.slug }}
              className="flex flex-col gap-0.5"
            >
              <span className="text-meta text-subtle">Previous</span>
              <span className="text-ui text-fg">{post.prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {post.next && (
            <Link
              to="/writing/$slug"
              params={{ slug: post.next.slug }}
              className="flex flex-col items-end gap-0.5 text-right"
            >
              <span className="text-meta text-subtle">Next</span>
              <span className="text-ui text-fg">{post.next.title}</span>
            </Link>
          )}
        </nav>
      )}
    </Page>
  )
}
