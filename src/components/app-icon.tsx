import type { Project } from '@/data/projects'

/**
 * A product's app-icon tile with the iOS-style finish from `.app-icon` in app.css. Every tile is
 * full-bleed so they all read at the same size; corners and shadow scale with `size`.
 */
export function AppIcon({
  project,
  size,
  className = '',
}: {
  project: Pick<Project, 'icon'>
  /** A number of px, or a CSS length like '1em' to follow the surrounding text. */
  size: number | string
  className?: string
}) {
  if (!project.icon) return null
  return (
    <span className={`app-icon ${className}`} style={{ width: size, height: size }}>
      <img src={project.icon} alt="" width={128} height={128} />
    </span>
  )
}
