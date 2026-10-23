// What the footer's "built …" popup lists: the sites and reading behind this one.
// Only things that were actually looked at while building it.

export type Credit = { label: string; href?: string; note: string }

/** Sites whose taste this one borrows from. */
export const lookedAt: Credit[] = [
  { label: 'Rauno Freiberg', href: 'https://rauno.me', note: 'interaction details' },
  { label: 'Emil Kowalski', href: 'https://emilkowal.ski', note: 'animation timing' },
  { label: 'Linear', href: 'https://linear.app', note: 'restraint, grain at low ink' },
  { label: 'Zed', href: 'https://zed.dev', note: 'dither on a quiet page' },
  { label: 'Mintlify', href: 'https://mintlify.com', note: 'shaders only in the margins' },
  { label: 'Vercel', href: 'https://vercel.com', note: 'slow shader fade-in' },
]

export const reading: Credit[] = [
  {
    label: 'Invisible details of interaction design',
    href: 'https://rauno.me/craft/interaction-design',
    note: 'Rauno Freiberg',
  },
  {
    label: '7 practical animation tips',
    href: 'https://emilkowal.ski/ui/7-practical-animation-tips',
    note: 'Emil Kowalski',
  },
  {
    label: "You don't need animations",
    href: 'https://emilkowal.ski/ui/you-dont-need-animations',
    note: 'Emil Kowalski',
  },
  {
    label: 'Web Interface Guidelines',
    href: 'https://vercel.com/design/guidelines',
    note: 'Vercel',
  },
  {
    label: "The particle shader behind Vercel's Ship",
    href: 'https://basement.studio/post/shipping-ship-behind-the-particle-shader-effect-for-vercels-conf',
    note: 'basement.studio',
  },
  {
    label: 'The magical world of particles with R3F and shaders',
    href: 'https://blog.maximeheckel.com/posts/the-magical-world-of-particles-with-react-three-fiber-and-shaders/',
    note: 'Maxime Heckel',
  },
  {
    label: 'Shape morphing directly with Metal',
    href: 'https://ikyle.me/blog/2026/creating-cool-ui-shape-morphing-directly-with-metal',
    note: 'ikyle.me',
  },
  {
    label: 'WebGL shader techniques for image transitions',
    href: 'https://tympanus.net/codrops/2025/01/22/webgl-shader-techniques-for-dynamic-image-transitions/',
    note: 'Codrops',
  },
  {
    label: 'Particle morphing with hover disperse',
    href: 'https://discourse.threejs.org/t/advanced-3d-effects-particle-morphing/88359',
    note: 'three.js forum',
  },
  {
    label: 'Same-document view transitions',
    href: 'https://developer.chrome.com/docs/web-platform/view-transitions/same-document',
    note: 'Chrome for Developers',
  },
  {
    label: 'Animation from interactions (WCAG 2.3.3)',
    href: 'https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html',
    note: 'W3C',
  },
]

export const madeWith: Credit[] = [
  { label: 'Sign Style', note: 'signature font, Redy Studio' },
  { label: 'Geist', href: 'https://vercel.com/font', note: 'type' },
  { label: 'Simple Icons', href: 'https://simpleicons.org', note: 'tech logos, CC0' },
  { label: 'Paper Shaders', href: 'https://shaders.paper.design', note: 'dither shaders' },
]
