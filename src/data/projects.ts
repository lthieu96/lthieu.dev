// Selected work on the home page, plus the case studies behind /work/$slug.
// To add a case study: give a project a `caseStudy`; the row links to it automatically.

export type DitherTone = {
  /** Flip light/dark before dithering. Use for light UI screenshots. */
  invert?: boolean
  contrast?: number
  gamma?: number
}

export type CaseStudyLink = { label: string; href: string }

export type CaseStudyMedia =
  | {
      kind: 'image'
      src: string
      alt: string
      caption?: string
      /** Looping mp4 shown in the same frame; `src` becomes its poster. 1600×1000. */
      video?: string
      /** A phone clip (720×1560) beside the video, at the same height. */
      phone?: { src: string; poster: string; label: string }
    }
  | {
      kind: 'phones'
      /** A slot without `src` renders as a labelled placeholder until the clip is recorded. */
      slots: { label: string; note: string; src?: string; poster?: string }[]
      caption?: string
    }

export type CaseStudySection = {
  heading: string
  body?: string
  items?: { title: string; body: string }[]
  /** A custom figure rendered after the body. See `components/case-study/figures.tsx`. */
  figure?: 'request-budget'
}

export type CaseStudy = {
  intro: string
  meta: { label: string; value: string }[]
  links?: CaseStudyLink[]
  /** Headline numbers under the media. Public figures only. */
  stats?: { value: string; label: string }[]
  media: CaseStudyMedia
  sections: CaseStudySection[]
}

/** The card that pops up when you hover a product name in the intro. */
export type ProjectPreview = {
  title: string
  body: string
  /** 300×139 in the card. `dither` keeps screenshots with real customer data unreadable. */
  image: { src: string; dither?: boolean } & DitherTone
  link?: { label: string; href: string }
  platforms: string
}

export type Project = {
  slug: string
  name: string
  /** Square app-icon tile, full-bleed (corners are rounded in CSS). 128px webp. */
  icon?: string
  /** One plain sentence on what I built. What the product is goes in `preview`. */
  summary: string
  tags: string[]
  years: string
  thumb: { src: string; alt: string } & DitherTone
  preview?: ProjectPreview
  caseStudy?: CaseStudy
}

export const projects: Project[] = [
  {
    slug: 'sway',
    name: 'Sway',
    icon: '/work/sway/icon.webp',
    summary: 'Trading backend on Hyperliquid: rate-limit gateway, settlement, rewards.',
    tags: ['Phone app', 'backend', 'Rust'],
    years: '2026–now',
    thumb: {
      src: '/work/sway/thumb.webp',
      alt: 'Sway artwork: the market for narratives',
      invert: true,
      gamma: 0.6,
      // Logo cards: push mid-tones to ink or paper so the lettering stays solid, not checkered.
      contrast: 2.4,
    },
    preview: {
      title: 'Sway: the market for narratives',
      body: 'An app that turns crypto news into cards. Swipe, take a side, and it becomes a real trade. I work on the phone app and its servers.',
      image: { src: '/work/sway/og.webp' },
      link: { label: 'sway.fun', href: 'https://sway.fun' },
      platforms: 'iOS · Android',
    },
    caseStudy: {
      intro:
        'An app that turns crypto news into cards. You swipe one, take a side, and it becomes a real trade. I work on the phone app and the servers behind it.',
      meta: [
        { label: 'Role', value: 'Software Engineer' },
        {
          label: 'Team',
          value: 'Small product team at KVY Technology',
        },
        { label: 'When', value: 'March 2026 – now' },
        { label: 'Built with', value: 'Expo, NestJS, Rust, Solidity' },
      ],
      links: [
        { label: 'sway.fun', href: 'https://sway.fun' },
        {
          label: 'App Store',
          href: 'https://apps.apple.com/us/app/sway-narrative-markets/id6767172902',
        },
        {
          label: 'Google Play',
          href: 'https://play.google.com/store/apps/details?id=fun.sway.mobile',
        },
      ],
      // Cut from iOS screen recordings (~/Movies/sway-raw2) by /tmp/sway-edit/build2.sh:
      // clock set to 9:41, recording dot hidden, account balance blurred.
      media: {
        kind: 'phones',
        slots: [
          {
            label: 'Browse assets and narratives',
            note: '13s loop',
            src: '/work/sway/sway-discover.mp4',
            poster: '/work/sway/sway-discover-poster.webp',
          },
          {
            label: 'Swipe through stories, open a trade',
            note: '20s loop',
            src: '/work/sway/sway-feed-trade.mp4',
            poster: '/work/sway/sway-feed-trade-poster.webp',
          },
          {
            label: 'A trader profile: performance and positions',
            note: '15s loop',
            src: '/work/sway/sway-profile.mp4',
            poster: '/work/sway/sway-profile-poster.webp',
          },
        ],
      },
      sections: [
        {
          heading: 'The idea',
          body: 'Markets move on stories: a listing, a hack, a tweet. Sway turns each story into a card. You swipe it, pick Bullish or Bearish, and the app places a matching trade for you.',
        },
        {
          heading: 'What I built',
          items: [
            {
              title: 'A traffic controller for the exchange',
              body: 'The exchange only allows so many requests a minute. I wrote a small Rust service that shares that budget fairly between trading, background jobs and phones.',
            },
            {
              title: 'A feed of finished trades',
              body: 'A separate service listens for completed trades and matches each one to the right user, with alerts when it falls behind.',
            },
            {
              title: 'Rewards paid on-chain',
              body: 'A Solidity contract that pays creators and referrers their share of fees, plus the server code that batches and checks every payout.',
            },
            {
              title: 'The app you hold',
              body: 'Screens across the Expo app: the feed, positions, notifications and the swipe itself.',
            },
          ],
        },
        {
          heading: 'What I learned',
          body: 'Real money makes small bugs loud. I now design for the messy cases first, like a close that reaches us before its own open, or two of our own users trading with each other, where our records kept only one side.',
        },
      ],
    },
  },
  {
    slug: 'cerebro',
    name: 'Cerebro',
    icon: '/work/cerebro/icon.webp',
    summary: 'Synced 8 exchanges plus EVM and Solana wallets into one portfolio.',
    tags: ['Web', 'backend', 'admin', '200K+ users'],
    years: '2025–2026',
    thumb: {
      src: '/work/cerebro/thumb.webp',
      alt: 'Cerebro wordmark on a purple wave background',
    },
    preview: {
      title: 'Cerebro: all your crypto in one place',
      body: 'A portfolio tracker for exchange accounts and wallets. I built the web app, the backend services and the admin tools.',
      image: { src: '/work/cerebro/preview.webp' },
      link: { label: 'cerebro.xyz', href: 'https://cerebro.xyz' },
      platforms: 'Web',
    },
    caseStudy: {
      intro:
        'A crypto portfolio tracker: all your accounts and wallets in one place. I built the web app, the backend services and the admin tools.',
      meta: [
        { label: 'Role', value: 'Software Engineer' },
        {
          label: 'Team',
          value: 'Product team at KVY Technology',
        },
        { label: 'When', value: '2025 – 2026' },
        { label: 'Built with', value: 'Next.js, NestJS, MongoDB, Redis' },
      ],
      links: [{ label: 'cerebro.xyz', href: 'https://cerebro.xyz' }],
      stats: [
        { value: '200K+', label: 'users' },
        { value: '7K+', label: 'daily active' },
        { value: '8', label: 'exchanges' },
        { value: '6', label: 'on-chain platforms' },
      ],
      media: {
        kind: 'image',
        // Recorded on a test account by /tmp/cerebro-rec/run3.mjs; the Alice research wait is sped up.
        src: '/work/cerebro/demo-poster.webp',
        video: '/work/cerebro/demo.mp4',
        alt: 'Cerebro demo: dashboard, assets, Alice, swap and performance on a test account',
        caption: 'Test account. The wait for Alice’s research is sped up.',
      },
      sections: [
        {
          heading: 'The idea',
          body: "People keep crypto in many places: exchanges, wallets, apps. Cerebro pulls it into one view, so you can see what you own and how it's doing.",
        },
        {
          heading: 'What I built',
          items: [
            {
              title: 'The web app',
              body: 'Portfolio pages in Next.js that stay fast and readable while numbers update.',
            },
            {
              title: 'Backend services',
              body: 'Node.js services and a data collector that pull portfolio data from 8 exchanges and 6 on-chain platforms.',
            },
            {
              title: 'Admin tools',
              body: 'An internal dashboard the team used to watch the data and fix problems.',
            },
            {
              title: 'Growing with users',
              body: 'The product grew to 200K+ users, with 7K+ daily active users, while I worked on it.',
            },
          ],
        },
        {
          heading: 'What I learned',
          body: 'When people check their money, the numbers have to be right and fast. I learned to show clearly when data is still loading or out of date, instead of guessing.',
        },
      ],
    },
  },
  {
    slug: 'benkon',
    name: 'BenKon',
    icon: '/work/benkon/icon.webp',
    summary: 'Admin, phone and tablet apps. Cut admin page loads by 30%.',
    tags: ['Web', 'phone', 'tablet'],
    years: '2023–2025',
    thumb: {
      src: '/work/benkon/thumb.webp',
      alt: 'BenKon logo: energy efficiency solutions',
      invert: true,
      gamma: 0.6,
      // Logo cards: push mid-tones to ink or paper so the lettering stays solid, not checkered.
      contrast: 2.4,
    },
    preview: {
      title: 'BenKon: office devices and meeting rooms',
      body: 'Apps to control office devices and book meeting rooms. I built the admin dashboard, the phone and tablet apps, and a floor-plan editor.',
      image: { src: '/work/benkon/preview.webp' },
      platforms: 'Web · phone · tablet',
    },
  },
  {
    slug: 'greenmaster',
    name: 'GreenMaster Go',
    icon: '/work/greenmaster/icon.webp',
    summary: 'Web admin, Expo phone app and Rails backend for pest-control visits.',
    tags: ['Web', 'phone', 'Rails', 'freelance'],
    years: '2025–2026',
    thumb: {
      src: '/work/greenmaster/thumb.webp',
      alt: 'Green Master logo: integrated pest management',
      invert: true,
      gamma: 0.6,
      // Logo cards: push mid-tones to ink or paper so the lettering stays solid, not checkered.
      contrast: 2.4,
    },
    preview: {
      title: 'GreenMaster Go: pest-control visits',
      body: 'Freelance for Madeezi. An ERP that takes each visit from report to sign-off: web admin, Expo phone app and a Rails backend.',
      image: { src: '/work/greenmaster/thumb.webp' },
      platforms: 'Web · phone',
    },
    caseStudy: {
      intro:
        'Software for a pest-control company. Technicians fill in each visit on their phone, the customer signs it off on the spot, and the office runs it all from the web. I built most of the backend, the web admin and the phone app.',
      meta: [
        { label: 'Role', value: 'Software Engineer' },
        { label: 'Team', value: 'Freelance for Madeezi, with one other developer' },
        { label: 'When', value: 'May 2025 – June 2026' },
        { label: 'Built with', value: 'Rails, React, Expo, PostgreSQL' },
      ],
      media: {
        kind: 'image',
        // Web: recorded headless by /tmp/gmg-rec/run2.mjs on the live admin (the new report is
        // cancelled), with client, staff and contact details swapped for sample data in the page
        // (mask.js); the test report is real. Phone: cut from an iOS screen recording
        // (~/Movies/gmg-raw/app.mp4) by /tmp/gmg-edit/build-app.sh: clock set to 9:41, recording dot
        // hidden, other client sites in the search blurred.
        src: '/work/greenmaster/greenmaster-web-poster.webp',
        video: '/work/greenmaster/greenmaster-web.mp4',
        alt: 'GreenMaster Go web admin: filling in a new service report, a report’s details, customers and the service catalog',
        phone: {
          src: '/work/greenmaster/greenmaster-app.mp4',
          poster: '/work/greenmaster/greenmaster-app-poster.webp',
          label: 'GreenMaster Go phone app: a visit, from new report to the customer’s signature',
        },
        caption: 'Names and contacts replaced with sample data; other client sites blurred.',
      },
      sections: [
        {
          heading: 'The idea',
          body: 'Every visit becomes a report: the site, the services, the work done in each area, the chemicals used, and the customer’s rating and sign-off. The office sees it as soon as the technician finishes.',
        },
        {
          heading: 'What I built',
          items: [
            {
              title: 'The phone app',
              body: 'An Expo app for technicians. They log in with a one-time code, pick the site, services and areas from bottom sheets, then hand the phone to the customer.',
            },
            {
              title: 'Customer sign-off',
              body: 'The customer rates the visit and confirms it with a signature or a one-time code. The code goes by Zalo when their number has it, by SMS otherwise.',
            },
            {
              title: 'The web admin',
              body: 'A React app for the office: customers, sites, contacts, staff by region, chemicals, and every report, with PDF export.',
            },
            {
              title: 'The backend',
              body: 'A Rails 8 API with roles, email invitations for new staff, and search across reports by number, site or contact.',
            },
          ],
        },
        {
          heading: 'What I learned',
          body: 'The person holding the app is standing in a customer’s kitchen. Every extra tap shows. I put the usual choice first and kept each step to one sheet.',
        },
      ],
    },
  },
]

export const caseStudies = projects.filter(
  (p): p is Project & { caseStudy: CaseStudy } => p.caseStudy !== undefined,
)

export const getProject = (slug: string) => projects.find((p) => p.slug === slug)

/** The case study after this one, wrapping around. */
export const nextCaseStudy = (slug: string) => {
  const i = caseStudies.findIndex((p) => p.slug === slug)
  return caseStudies[(i + 1) % caseStudies.length]
}

export type SideProject = { name: string; summary: string; href: string; linkLabel: string }

export const sideProjects: SideProject[] = [
  {
    name: 'EngCoach',
    summary: 'Fixes my work English and turns mistakes into flashcards.',
    href: 'https://github.com/lthieu96/engcoach',
    linkLabel: 'GitHub',
  },
  {
    name: 'Chat Polish',
    summary: 'A calmer chat screen for the Paseo AI coding app.',
    href: 'https://github.com/lthieu96/paseo-chat-polish',
    linkLabel: 'GitHub',
  },
]
