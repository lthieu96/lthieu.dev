export interface ExperienceRole {
  id: string
  company: string
  companyUrl?: string
  role: string
  type?: string
  period: string
  bullets: string[]
  skills: string[]
  current?: boolean
}

export const experienceRoles: ExperienceRole[] = [
  {
    id: 'kvy-software-engineer',
    company: 'KVY Technology',
    companyUrl: 'https://kvytechnology.com/',
    role: 'Software Engineer',
    type: 'Full-time',
    period: '2025 — Present',
    current: true,
    bullets: [
      'Designed and implemented the Cerebro web application with Next.js and backend services with Node.js.',
      'Supported product growth reaching 200,000+ users and 7,000+ daily active users.',
      'Worked on portfolio management features and real-time crypto data handling.',
      'Built internal admin and data collection systems across 6 on-chain platforms and 8 major exchanges.',
    ],
    skills: ['Next.js', 'NestJS', 'TypeScript', 'MongoDB', 'Redis', 'Real-time Data'],
  },
  {
    id: 'benkon-software-engineer',
    company: 'BenKon',
    companyUrl: 'https://www.linkedin.com/company/benkon/posts',
    role: 'Software Engineer',
    type: 'Full-time',
    period: '2024 — 2025',
    bullets: [
      'Developed admin dashboard features and helped re-architect parts of the system, reducing page load time by 30%.',
      'Delivered and improved mobile and tablet applications for device control and meeting room management.',
      'Built internal platforms such as a CMS, i18n system, and icon library to improve consistency and developer productivity.',
    ],
    skills: ['Admin Dashboard', 'CMS', 'i18n', 'Mobile Apps', 'Tablet Apps'],
  },
  {
    id: 'benkon-intern',
    company: 'BenKon',
    companyUrl: 'https://www.linkedin.com/company/benkon/posts',
    role: 'Front-end Developer Intern',
    type: 'Internship',
    period: '2023 — 2024',
    bullets: [
      'Built an interactive floor plan and equipment layout editor using React, Node.js, and SVG.',
      'Owned the project end to end as a solo developer.',
    ],
    skills: ['React', 'Node.js', 'SVG', 'Editor UX'],
  },
]

export const sideProjects: ExperienceRole[] = [
  {
    id: 'greenmaster-go',
    company: 'GreenMaster Go',
    role: 'ERP platform for field operations',
    period: 'Selected work',
    bullets: [
      'Built an ERP-style product to help digitize workflows for more than 3,800 customers and 200 technicians.',
      'Worked across web and mobile surfaces to support operational flows used in day-to-day field work.',
    ],
    skills: ['ERP', 'React', 'React Native', 'Rails', 'PostgreSQL'],
  },
  {
    id: 'express-boilerplate',
    company: 'Express Boilerplate',
    companyUrl: 'https://github.com/lthieu96/express-typescript',
    role: 'Reusable REST API starter',
    period: 'Open source',
    bullets: [
      'Created a reusable backend starter focused on authentication, API structure, and practical project setup.',
      'Used it as a foundation for learning and for speeding up small service prototypes.',
    ],
    skills: ['Express.js', 'TypeScript', 'MongoDB', 'JWT', 'OAuth'],
  },
]

export const education = {
  school: 'University of Information Technology — VNUHCM',
  period: '2019 — 2025',
  major: 'Software Engineering',
  classification: 'Very Good',
}

export const contact = {
  email: 'lthieu9601@gmail.com',
  phone: '0961 500 817',
  phoneHref: 'tel:+84961500817',
  location: 'Ho Chi Minh City, Viet Nam',
  github: 'https://github.com/lthieu96',
  linkedin: 'https://www.linkedin.com/in/l%C3%AA-trung-hi%E1%BA%BFu-20915b29a/',
}
