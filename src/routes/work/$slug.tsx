import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { AppIcon } from '@/components/app-icon'
import { Media, MetaTable, Sections } from '@/components/case-study'
import { Arrow, delay, Page, TopBar } from '@/components/layout'
import { getProject, nextCaseStudy } from '@/data/projects'
import { seo } from '@/lib/seo'

export const Route = createFileRoute('/work/$slug')({
  loader: ({ params }) => {
    const project = getProject(params.slug)
    if (!project?.caseStudy) throw notFound()
    return { slug: project.slug }
  },
  head: ({ loaderData }) => {
    const project = loaderData && getProject(loaderData.slug)
    return { meta: seo({ title: project?.name, description: project?.caseStudy?.intro }) }
  },
  component: CaseStudyPage,
})

function CaseStudyPage() {
  const { slug } = Route.useLoaderData()
  const project = getProject(slug)
  const study = project?.caseStudy
  if (!project || !study) return null
  const next = nextCaseStudy(slug)

  return (
    <article className="pb-24">
      <Page className="pb-14">
        <TopBar back="/" label="Work" />
        <header className="mt-20">
          <div className="flex items-center gap-3">
            {/* Outside the entrance: the view transition brings the icon in (flying from the intro,
                or fading), and an entrance still running when it lands would make it flicker. */}
            <AppIcon project={project} size={36} className="[view-transition-name:app-icon]" />
            <h1 className="enter text-h1 font-medium text-fg" style={delay(1)}>
              {project.name}
            </h1>
          </div>
          <p className="enter mt-3 text-body text-muted" style={delay(1)}>
            {study.intro}
          </p>
        </header>
        <div className="enter mt-8" style={delay(2)}>
          <MetaTable meta={study.meta} links={study.links} />
        </div>
      </Page>

      <div className="enter" style={delay(3)}>
        <Media media={study.media} />
      </div>

      <div className="enter mx-auto w-full max-w-[640px] px-5 pt-16" style={delay(4)}>
        <Sections sections={study.sections} />
        {next && next.slug !== slug && (
          <nav className="mt-16 flex justify-between border-line border-t pt-6 text-ui">
            <span className="text-subtle">Next project</span>
            <Link
              to="/work/$slug"
              params={{ slug: next.slug }}
              className="group text-fg hover:underline"
            >
              {next.name} <Arrow dir="→" />
            </Link>
          </nav>
        )}
      </div>
    </article>
  )
}
