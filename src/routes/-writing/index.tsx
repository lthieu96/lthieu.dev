import { createFileRoute, Link } from '@tanstack/react-router'
import { delay, ListRow, Page, TopBar } from '@/components/layout'
import { getPostList } from '@/lib/posts'
import { seo } from '@/lib/seo'

const description =
  "Notes from building web and mobile products: what broke, how I fixed it, and what I'd change."

export const Route = createFileRoute('/writing/')({
  loader: () => getPostList(),
  head: () => ({ meta: seo({ title: 'Writing', description }) }),
  component: Writing,
})

function Writing() {
  const posts = Route.useLoaderData()
  const drafts = posts.filter((p) => p.draft).length

  return (
    <Page className="pb-24">
      <TopBar back="/" label="Home" />
      <header className="enter mt-20" style={delay(1)}>
        <h1 className="text-h1 font-medium text-fg">Writing</h1>
        <p className="mt-3 text-body text-muted">{description}</p>
      </header>

      <section className="enter mt-14" style={delay(2)}>
        <div className="flex justify-between text-ui text-subtle">
          <h2>2026</h2>
          <span>{drafts === posts.length ? `${drafts} drafts` : `${posts.length} posts`}</span>
        </div>
        <ul className="mt-4 flex flex-col gap-4">
          {posts.map((p) => (
            <li key={p.slug}>
              <ListRow
                title={
                  p.hasBody ? (
                    <Link to="/writing/$slug" params={{ slug: p.slug }} className="hover:underline">
                      {p.title}
                    </Link>
                  ) : (
                    p.title
                  )
                }
                description={p.summary}
                aside={p.tag}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="enter mt-[72px] flex flex-col gap-2" style={delay(3)}>
        <h2 className="text-ui text-subtle">Get new posts</h2>
        <p className="text-list text-muted">
          Follow the{' '}
          <a
            href="/rss.xml"
            className="text-fg underline decoration-fg/20 underline-offset-[3px] hover:decoration-fg/60"
          >
            RSS feed
          </a>
          . One item when something new is up. Nothing else.
        </p>
      </section>
    </Page>
  )
}
