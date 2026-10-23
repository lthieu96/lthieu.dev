import { createFileRoute, Link } from '@tanstack/react-router'
import { CopyButton } from '@/components/copy-button'
import { Footer } from '@/components/footer'
import { Intro } from '@/components/home/intro'
import { ProductMention } from '@/components/home/product-mention'
import { ProjectList } from '@/components/home/project-row'
import { StackList } from '@/components/home/stack-list'
import { Arrow, ListRow, Page, Section } from '@/components/layout'
import { PageDither } from '@/components/shaders/dither-field'
import { education, experience, stack } from '@/data/about'
import { projects, sideProjects } from '@/data/projects'
import { site, socialHref } from '@/data/site'
import { external } from '@/lib/external'

export const Route = createFileRoute('/')({
  component: Home,
})

const strong =
  'text-fg underline decoration-fg/0 underline-offset-[3px] transition-[text-decoration-color] duration-150 hover:decoration-fg/50'

function Home() {
  return (
    <>
      <PageDither />
      <Page className="flex flex-col gap-16 pb-16 sm:gap-[88px]">
        <Intro />

        <Section title="Selected work" i={3} id="work">
          <ProjectList projects={projects} />
        </Section>

        <Section title="Side projects" i={4}>
          <ul className="flex flex-col gap-4">
            {sideProjects.map((p) => (
              <li key={p.name}>
                <ListRow
                  title={p.name}
                  description={p.summary}
                  aside={
                    <a
                      href={p.href}
                      className="group font-mono text-meta text-accent hover:underline"
                      {...external(p.href)}
                    >
                      {p.linkLabel} <Arrow dir="↗" />
                    </a>
                  }
                />
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Experience" i={5}>
          <ul className="flex flex-col gap-4">
            {experience.map((e) => (
              <li key={e.org}>
                <ListRow
                  title={
                    <>
                      {e.org}
                      <span className="ml-2 text-ui text-subtle">{e.kind}</span>
                    </>
                  }
                  description={e.line.map((part, i) =>
                    typeof part === 'string' ? (
                      part
                    ) : (
                      // biome-ignore lint/suspicious/noArrayIndexKey: the parts never reorder
                      <ProductMention key={i} slug={part.project} />
                    ),
                  )}
                  aside={e.years}
                />
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Education" i={6}>
          <ul className="flex flex-col gap-4">
            {education.map((e) => (
              <li key={e.org}>
                <ListRow title={e.org} description={e.line} aside={e.years} />
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Stack" i={7}>
          <StackList stack={stack} />
        </Section>

        <Section title="Connect" i={8}>
          <p className="text-list text-muted">
            Want to build something, or just say hi? Email me at{' '}
            {/* The copy button floats above the address on hover or focus, so it never sits in
                the sentence. The pb-1.5 strip keeps the hover alive on the way up to it. */}
            <span className="group/email relative">
              <a href={`mailto:${site.email}`} className={strong}>
                {site.email}
              </a>
              <span className="pointer-events-none absolute right-0 bottom-full pb-1.5 opacity-0 transition-opacity duration-150 ease-(--ease-out) group-focus-within/email:pointer-events-auto group-focus-within/email:opacity-100 group-hover/email:pointer-events-auto group-hover/email:opacity-100">
                <CopyButton
                  text={() => site.email}
                  label="Copy email address"
                  className="grid size-7 rounded-md border border-line bg-card"
                />
              </span>
            </span>
            . I usually reply within a day. My code's on{' '}
            <a href={socialHref('GitHub')} className={strong} {...external(socialHref('GitHub'))}>
              GitHub
            </a>
            , my history's on{' '}
            <a
              href={socialHref('LinkedIn')}
              className={strong}
              {...external(socialHref('LinkedIn'))}
            >
              LinkedIn
            </a>
            , and there's a{' '}
            <Link to="/resume" className={strong}>
              one-page resume
            </Link>
            .
          </p>
        </Section>

        <Footer i={9} />
      </Page>
    </>
  )
}
