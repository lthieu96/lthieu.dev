// Everything about "me" that shows up in more than one place.
export const site = {
  name: 'Hieu Le',
  role: 'Full-Stack Developer',
  city: 'Saigon',
  timeZone: 'Asia/Ho_Chi_Minh',
  url: 'https://lthieu.dev',
  description:
    'Hieu Le, a full-stack developer in Saigon. I build products end to end: web apps, mobile apps, and the backend that keeps them running.',
  email: 'lthieu9601@gmail.com',
  /** This site's source. The footer links its build commit here. */
  repo: 'https://github.com/lthieu96/lthieu.dev',
  /** Footer "Now:" line. */
  now: 'learning Rust by building with it.',
  /** Footer "Updated" date. Bump it when the content changes. */
  updated: '2026-10-22',
} as const

export type SocialLink = { label: string; href: string; icon: 'mail' | 'github' | 'linkedin' | 'x' }

export const socials: SocialLink[] = [
  { label: 'Email', href: `mailto:${site.email}`, icon: 'mail' },
  { label: 'GitHub', href: 'https://github.com/lthieu96', icon: 'github' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/lthieu96/', icon: 'linkedin' },
  // Add X when there's a handle: { label: 'X', href: 'https://x.com/…', icon: 'x' },
]

export const socialHref = (label: SocialLink['label']) =>
  socials.find((s) => s.label === label)?.href ?? '/'
