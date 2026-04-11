export type ShowcaseMedia =
  | {
      type: 'image'
      src: string
      alt: string
    }
  | {
      type: 'video'
      src: string
      alt: string
      poster: string
    }

export interface ShowcaseProject {
  slug: string
  title: string
  role: string
  period: string
  summary: string
  tags: string[]
  media: ShowcaseMedia[]
}

function videoGallery(
  files: readonly {
    src: string
    poster: string
    alt: string
  }[],
): ShowcaseMedia[] {
  return files.map((file) => ({
    type: 'video' as const,
    src: file.src,
    poster: file.poster,
    alt: file.alt,
  }))
}

function imageGallery(
  project: string,
  files: readonly string[],
  altPrefix: string,
): ShowcaseMedia[] {
  return files.map((file, index) => ({
    type: 'image' as const,
    src: `/works/showcase/${project}/${file}`,
    alt: `${altPrefix} screen ${index + 1}`,
  }))
}

export const showcaseProjects: ShowcaseProject[] = [
  {
    slug: 'cerebro',
    title: 'Cerebro',
    role: 'Software Engineer',
    period: '2025 → Present',
    summary:
      'Portfolio management surfaces, operational dashboards, and high-density product flows designed to stay readable under real-time crypto data.',
    tags: ['Next.js', 'Dashboard Systems', 'Real-time Data'],
    media: [
      ...videoGallery([
        {
          src: 'https://1916iuqinl.ufs.sh/f/80nP6vklQJwGxhCbCv1ihYnUuyZP9rmgvB4b03cwHLFpCEG6',
          poster: '/works/showcase/cerebro/dashboard-1.png',
          alt: 'Cerebro product walkthrough 1',
        },
        {
          src: 'https://1916iuqinl.ufs.sh/f/80nP6vklQJwG84qqM2lQJwGaViyTt48OzupBqNXfF0LcPlYE',
          poster: '/works/showcase/cerebro/dashboard-2.png',
          alt: 'Cerebro product walkthrough 2',
        },
        {
          src: 'https://1916iuqinl.ufs.sh/f/80nP6vklQJwGArvdOV7U5KTcx0rovswSmCnXB9yLOEaNF8dP',
          poster: '/works/showcase/cerebro/dashboard-3.png',
          alt: 'Cerebro product walkthrough 3',
        },
      ]),
      ...imageGallery(
        'cerebro',
        [
          'dashboard-1.png',
          'dashboard-2.png',
          'dashboard-3.png',
          'dashboard-4.png',
          'dashboard-5.png',
          'dashboard-6.png',
          'dashboard-7.png',
          'dashboard-8.png',
          'dashboard-9.png',
          'dashboard-10.png',
        ],
        'Cerebro dashboard',
      ),
    ],
  },
  {
    slug: 'benkon',
    title: 'BenKon',
    role: 'Frontend Developer',
    period: '2023 → 2025',
    summary:
      'Enterprise control interfaces for devices and meeting spaces, focused on clarity, latency reduction, and dependable admin tooling.',
    tags: ['Admin Dashboard', 'Control Systems', 'B2B UX'],
    media: imageGallery(
      'benkon',
      ['dashboard-1.png', 'dashboard-2.png', 'dashboard-3.png', 'dashboard-4.png'],
      'BenKon dashboard',
    ),
  },
  {
    slug: 'greenmaster',
    title: 'Greenmaster',
    role: 'Frontend Engineer',
    period: 'Selected Work',
    summary:
      'A compact product system spanning desktop dashboards and mobile views, with an emphasis on hierarchy, spacing discipline, and responsive consistency.',
    tags: ['Responsive UI', 'Mobile Surfaces', 'Product Design'],
    media: imageGallery(
      'greenmaster',
      [
        'dashboard-1.png',
        'dashboard-2.png',
        'dashboard-3.png',
        'dashboard-4.png',
        'mobile-1.jpeg',
        'mobile-2.jpeg',
        'mobile-3.jpeg',
        'mobile-4.jpeg',
        'mobile-5.jpeg',
        'mobile-6.jpeg',
      ],
      'Greenmaster interface',
    ),
  },
]
