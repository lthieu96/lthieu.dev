// Short versions for the home page. The long versions live in `resume.ts`.

/** A line of text; `{ project }` parts render as the product's icon and name, with its preview. */
export type RichLine = (string | { project: string })[]

export const experience: { org: string; kind: string; line: RichLine; years: string }[] = [
  {
    org: 'KVY Technology',
    kind: 'Full-time',
    line: [
      'Software Engineer on ',
      { project: 'sway' },
      ', before that ',
      { project: 'cerebro' },
      '.',
    ],
    years: '2025–now',
  },
  {
    org: 'Madeezi',
    kind: 'Freelance',
    line: [
      'Built ',
      { project: 'greenmaster' },
      ', an ERP for 3,800+ customers and 200 technicians.',
    ],
    years: '2025–2026',
  },
  {
    org: 'BenKon',
    kind: 'Intern, then full-time',
    line: ['Admin, phone and tablet apps for booking rooms and office devices.'],
    years: '2023–2025',
  },
]

export const education = [
  { org: 'UIT, VNUHCM', line: 'B.Sc. Software Engineering, Very Good.', years: '2019–2025' },
]

export const stack = [
  { label: 'Apps', value: 'TypeScript, React, Next.js, Remix, React Native (Expo)' },
  { label: 'Servers', value: 'Node.js, NestJS, Express, Rails, Rust' },
  { label: 'Data', value: 'MongoDB, PostgreSQL, Redis, BullMQ' },
  { label: 'Tools', value: 'Docker, GCP, GitHub Actions, Sentry' },
]
