// The one-page resume at /resume. It prints to A4. Keep it to one page.
// Text supports **bold** (use it for metrics: recruiters skim for them) and [label](url) links.
import { site, socialHref } from './site'

export const resume = {
  name: site.name,
  headline: `${site.role} · Ho Chi Minh City`,
  contact: [
    { label: site.email, href: `mailto:${site.email}` },
    { label: '+84 961 500 817', href: 'tel:+84961500817' },
    { label: 'github.com/lthieu96', href: socialHref('GitHub') },
    { label: 'linkedin.com/in/lthieu96', href: socialHref('LinkedIn') },
    { label: 'lthieu.dev', href: site.url },
  ],
  summary:
    'Full-stack developer with 3+ years of experience. I build products end to end: web apps, mobile apps and the backend that keeps them running, most recently for a crypto app with **200K+ users**.',
  // Mirrors resume/resume-berkeley.tex (the downloadable PDF). Change both together.
  // "Company · role": the role sits on its own line under the company.
  experience: [
    {
      title: 'KVY Technology · Software Engineer',
      when: '2025 – now',
      bullets: [],
      // Cerebro first: it has the numbers. Sway is the current work.
      groups: [
        {
          title: 'Cerebro ([cerebro.xyz](https://cerebro.xyz)) · crypto portfolio tracker',
          when: '2025 – 2026',
          bullets: [
            'Built the Next.js web app and Node.js backend as it grew to **200K+ users** and **7K+ daily active users**.',
            'Integrated **8 exchanges** and **6 on-chain platforms** for data collection, plus its admin dashboard.',
          ],
        },
        {
          title: 'Sway ([sway.fun](https://sway.fun)) · narrative trading app',
          when: '2026 – now',
          bullets: [
            'Built reward settlement: payout backend, Solidity claim/clawback contract on Arbitrum, drift alarms.',
            'Moved trade fills into a standalone NestJS stream service with per-tenant queues and lag alerts.',
            'Wrote a Rust gateway that budgets the exchange rate limit across services and streams prices.',
            'Built notifications end to end, from risk alerts to the Expo inbox, plus wallet and P&L screens.',
          ],
        },
      ],
    },
    {
      title: 'Madeezi · Freelance Developer',
      when: '2025 – 2026',
      bullets: [],
      groups: [
        {
          title:
            'GreenMaster Go ([lthieu.dev/work/greenmaster](https://lthieu.dev/work/greenmaster)) · field-service app',
          when: '',
          bullets: [
            'Delivered the Rails API, React admin and Expo app for **3,800+ customers** and **200 technicians**.',
            'Implemented visit sign-off on the technician’s phone by signature or a Zalo/SMS one-time code.',
          ],
        },
      ],
    },
    {
      title: 'BenKon · Front-end Intern → Software Engineer',
      when: '2023 – 2025',
      bullets: [
        'Re-architected the admin dashboard, cutting page load time by **30%**.',
        'Shipped the BenKon App and Surface App for device control and meeting rooms, plus a CMS and i18n.',
        'As an intern, created an interactive floor-plan and equipment layout editor in React and SVG, solo.',
      ],
    },
  ],
  projects: [
    {
      title:
        'EngCoach ([github.com/lthieu96/engcoach](https://github.com/lthieu96/engcoach)) · Next.js, Supabase, AI SDK',
      when: '',
      bullets: [
        'AI coach for workplace English: writing corrections, spaced-repetition flashcards, voice roleplay.',
      ],
    },
    {
      title:
        'Chat Polish ([github.com/lthieu96/paseo-chat-polish](https://github.com/lthieu96/paseo-chat-polish)) · Paseo plugin',
      when: '',
      bullets: [
        'Redraws the agent chat, with themes, a live-preview dashboard and interactive HTML pages.',
      ],
    },
  ],
  skills: [
    { label: 'Languages', value: 'TypeScript, JavaScript, Ruby, SQL, Rust, Solidity' },
    { label: 'Frontend', value: 'React, Next.js, React Native / Expo' },
    { label: 'Backend', value: 'Node.js, NestJS, Express, Rails' },
    { label: 'Data', value: 'MongoDB, Redis, PostgreSQL' },
    { label: 'Infra', value: 'Docker, GCP, GitHub Actions, Sentry' },
  ],
  education: {
    title: 'University of Information Technology, VNUHCM · Software Engineering, GPA 8.24/10',
    when: '2019 – 2025',
  },
}
