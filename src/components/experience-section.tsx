'use client'

import { Code02, LayersTwo01, Monitor01 } from '@untitledui/icons'
import { Section } from '@/components/section'
import {
  type ExperienceItemType,
  WorkExperience,
} from '@/components/work-experience/work-experience'

const experiences: ExperienceItemType[] = [
  {
    id: 'kvy',
    companyName: 'KVY Technology',
    companyLogo: '/works/kvytech_logo.jpeg',
    companyWebsite: 'https://kvytechnology.com/',
    isCurrentEmployer: true,
    positions: [
      {
        id: 'kvy-software-engineer',
        title: 'Software Engineer',
        employmentType: 'Full-time',
        employmentPeriod: {
          start: '01.2025',
        },
        icon: <Code02 strokeWidth={1.8} />,
        isExpanded: true,
        description: `
- Designed and implemented the Cerebro web application with **Next.js** and backend services with **Node.js**.
- Supported product growth reaching **200,000+ users** and **7,000+ daily active users**.
- Worked on portfolio management features and real-time crypto data handling.
- Built internal admin and data collection systems across **6 on-chain platforms** and **8 major exchanges**.
        `.trim(),
        skills: ['Next.js', 'Node.js', 'Admin Dashboard', 'Crypto Data', 'TypeScript'],
      },
    ],
  },
  {
    id: 'benkon',
    companyName: 'BenKon',
    companyLogo: '/works/benkon_logo.webp',
    companyWebsite: 'https://www.linkedin.com/company/benkon/posts',
    positions: [
      {
        id: 'benkon-software-engineer',
        title: 'Software Engineer',
        employmentType: 'Full-time',
        employmentPeriod: {
          start: '04.2024',
          end: '01.2025',
        },
        icon: <LayersTwo01 strokeWidth={1.8} />,
        description: `
- Developed admin dashboard features and helped re-architect parts of the system, reducing page load time by **30%**.
- Delivered and improved mobile and tablet applications for device control and meeting room management.
- Built internal platforms such as a **CMS**, **i18n system**, and **icon library** to improve consistency and developer productivity.
        `.trim(),
        skills: ['Admin Dashboard', 'CMS', 'i18n', 'Mobile Apps', 'Tablet Apps'],
      },
      {
        id: 'benkon-intern',
        title: 'Front-end Developer Intern',
        employmentType: 'Internship',
        employmentPeriod: {
          start: '10.2023',
          end: '01.2024',
        },
        icon: <Monitor01 strokeWidth={1.8} />,
        description: `
- Built an interactive floor plan and equipment layout editor using **React**, **Node.js**, and **SVG**.
- Owned the project end to end as a solo developer.
        `.trim(),
        skills: ['React', 'Node.js', 'SVG', 'Editor UX'],
      },
    ],
  },
]

const projects: ExperienceItemType[] = [
  {
    id: 'greenmaster-go',
    companyName: 'GreenMaster Go',
    positions: [
      {
        id: 'greenmaster-go-project',
        title: 'ERP platform for field operations',
        icon: <LayersTwo01 strokeWidth={1.8} />,
        isExpanded: true,
        description: `
- Built an ERP-style product to help digitize workflows for more than **3,800 customers** and **200 technicians**.
- Worked across web and mobile surfaces to support operational flows used in day-to-day field work.
        `.trim(),
        skills: ['ERP', 'React', 'React Native', 'Rails', 'PostgreSQL'],
      },
    ],
  },
  {
    id: 'express-boilerplate',
    companyName: 'Express Boilerplate',
    companyWebsite: 'https://github.com/lthieu96/express-typescript',
    positions: [
      {
        id: 'express-boilerplate-project',
        title: 'Reusable REST API starter',
        icon: <Code02 strokeWidth={1.8} />,
        description: `
- Created a reusable backend starter focused on authentication, API structure, and practical project setup.
- Used it as a foundation for learning and for speeding up small service prototypes.
        `.trim(),
        skills: ['Express.js', 'TypeScript', 'MongoDB', 'JWT', 'OAuth'],
      },
    ],
  },
]

export function ExperienceSection() {
  return (
    <Section>
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Experience
        </p>

        <div className="mt-6">
          <WorkExperience className="px-0" experiences={experiences} />
        </div>

        <div className="mt-10">
          <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            Projects
          </p>

          <div className="mt-6">
            <WorkExperience className="px-0" experiences={projects} />
          </div>
        </div>
      </div>
    </Section>
  )
}
