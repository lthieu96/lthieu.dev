import { PreviewCard } from '@base-ui/react/preview-card'
import { Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { AppIcon } from '@/components/app-icon'
import { Arrow } from '@/components/layout'
import { DitherImage } from '@/components/shaders/dither-image'
import { getProject, type Project, type ProjectPreview } from '@/data/projects'
import { external } from '@/lib/external'

const nameLink =
  'text-fg underline decoration-fg/0 decoration-1 underline-offset-[3px] transition-[text-decoration-color] duration-150 hover:decoration-fg/40 data-popup-open:decoration-fg/40'

function Card({ preview }: { preview: ProjectPreview }) {
  const { image } = preview
  return (
    <>
      {image.dither ? (
        <DitherImage {...image} alt="" revealed={false} className="h-[139px] w-full" />
      ) : (
        <img
          src={image.src}
          alt=""
          width={300}
          height={139}
          className="h-[139px] w-full object-cover"
        />
      )}
      <div className="flex flex-col gap-1 px-3.5 py-3">
        <p className="text-ui font-medium text-fg">{preview.title}</p>
        <p className="text-meta text-muted">{preview.body}</p>
        <div className="flex justify-between gap-4 pt-1.5 font-mono text-meta">
          {preview.link ? (
            <a
              href={preview.link.href}
              className="group text-accent hover:underline"
              {...external(preview.link.href)}
            >
              {preview.link.label} <Arrow dir="↗" />
            </a>
          ) : (
            <span />
          )}
          <span className="text-subtle">{preview.platforms}</span>
        </div>
      </div>
    </>
  )
}

/**
 * Names the clicked icon so the case-study header's icon grows out of it (see app.css). Names
 * must be unique on the page, and the same product can be mentioned twice, so clear the rest.
 */
function flyIcon(e: React.MouseEvent<HTMLElement>) {
  for (const el of document.querySelectorAll<HTMLElement>('.app-icon')) {
    el.style.viewTransitionName = ''
  }
  const icon = e.currentTarget.querySelector<HTMLElement>('.app-icon')
  if (icon) icon.style.viewTransitionName = 'app-icon'
}

/** The name as it appears in the text: a link to the case study, or plain text. */
function Name({ project, ...props }: { project: Project } & Record<string, unknown>) {
  return project.caseStudy ? (
    <Link to="/work/$slug" params={{ slug: project.slug }} className={nameLink} {...props}>
      {project.name}
    </Link>
  ) : (
    // Focusable so keyboard users can open the preview too.
    // biome-ignore lint/a11y/noNoninteractiveTabindex: the preview card opens on focus
    <span tabIndex={0} className={nameLink} {...props}>
      {project.name}
    </span>
  )
}

/**
 * A product named in the intro: app icon + name, with a preview card on hover or focus.
 * The card is extra context; everything in it is also reachable from the page.
 */
export function ProductMention({ slug }: { slug: string }) {
  const project = getProject(slug)
  const previewSrc = project?.preview?.image.src
  // Fetch the card image early so it's there when the card opens, not a beat later.
  useEffect(() => {
    if (previewSrc) new Image().src = previewSrc
  }, [previewSrc])
  if (!project) return null

  const icon = (
    // 1em icon, one word-space (0.25em) after it to match the space before. -0.145em puts the
    // icon's centre on the centre of Geist's capitals (cap height ≈ 0.71em), not the x-height.
    <AppIcon project={project} size="1em" className="mr-[0.25em] align-[-0.145em]" />
  )
  if (!project.preview) {
    return (
      <span className="whitespace-nowrap" onClickCapture={project.caseStudy ? flyIcon : undefined}>
        {icon}
        <Name project={project} />
      </span>
    )
  }

  return (
    <PreviewCard.Root>
      <span className="whitespace-nowrap" onClickCapture={project.caseStudy ? flyIcon : undefined}>
        {icon}
        {/* Short enough to feel instant, long enough that a passing cursor doesn't open it. */}
        <PreviewCard.Trigger delay={120} render={<Name project={project} />} />
      </span>
      <PreviewCard.Portal>
        <PreviewCard.Positioner side="bottom" align="start" sideOffset={10} collisionPadding={16}>
          <PreviewCard.Popup className="w-[300px] origin-(--transform-origin) overflow-hidden rounded-[14px] border border-edge bg-card shadow-[0_18px_48px_var(--color-card-shadow)] transition-[opacity,scale,filter] duration-150 ease-(--ease-out) data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0 data-starting-style:blur-[2px]">
            <Card preview={project.preview} />
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    </PreviewCard.Root>
  )
}
