// The one-page resume at /resume. It prints to A4. Keep it to one page.
// Text supports **bold** (use it for metrics: recruiters skim for them) and [label](url) links.
import { site, socialHref } from './site'

export const resume = {
  name: site.name,
  headline: `${site.role} · Ho Chi Minh City`,
  contact: [
    { label: site.email, href: `mailto:${site.email}` },
    { label: 'github.com/lthieu96', href: socialHref('GitHub') },
    { label: 'linkedin.com/in/lthieu96', href: socialHref('LinkedIn') },
    { label: 'lthieu.dev', href: site.url },
  ],
  summary:
    'Full-stack developer with 3+ years of experience. I build products end to end: web apps, mobile apps and the backend that keeps them running, most recently for a crypto app with **200K+ users**.',
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
            'Built the Next.js web app and Node.js backend as the product grew to **200K+ users** and **7K+ daily active users**.',
            'Built data collection across **8 exchanges** and **6 on-chain platforms**, plus the admin dashboard the team used to watch it.',
          ],
        },
        {
          title: 'Sway ([sway.fun](https://sway.fun)) · narrative trading app',
          when: '2026 – now',
          bullets: [
            "Built a Rust service that shares the exchange's request limit so trades always go first.",
            'Wrote the Solidity contract that pays fee rewards on Arbitrum, plus the backend that batches and checks payouts.',
            'Split completed-trade matching into its own service with lag alerts; built notifications and app screens in Expo.',
          ],
        },
      ],
    },
    {
      title: 'Madeezi · Freelance Full-Stack Developer',
      when: '2025 – 2026',
      bullets: [
        'Built GreenMaster Go, an end-to-end ERP for **3,800+ customers** and **200 technicians**: web admin, Expo phone app and a Rails backend that replaced paper reports.',
      ],
    },
    {
      title: 'BenKon · Software Engineer',
      when: '2024 – 2025',
      bullets: [
        'Re-architected the admin dashboard, cutting page load time by **30%**.',
        'Shipped the BenKon App and Surface App for device control and meeting rooms; built a CMS, i18n system and icon library.',
      ],
    },
    {
      title: 'BenKon · Front-end Developer Intern',
      when: '2023 – 2024',
      bullets: [
        'Built an interactive floor-plan and equipment layout editor in React and SVG, solo.',
      ],
    },
  ],
  skills: [
    { label: 'Frontend', value: 'React, Next.js, React Native / Expo' },
    { label: 'Backend', value: 'Node.js, NestJS, Express, Rails, Rust' },
    { label: 'Data', value: 'MongoDB, Redis, PostgreSQL' },
    { label: 'Infra', value: 'Docker, GCP, GitHub Actions, Sentry' },
  ],
  education: {
    title: 'University of Information Technology, VNUHCM · Software Engineering, Very Good',
    when: '2019 – 2025',
  },
}
