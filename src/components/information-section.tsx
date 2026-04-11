'use client'

import {
  ArrowRight,
  Clock,
  Code02,
  Link03,
  Mail01,
  MarkerPin01,
  PhoneCall01,
  User01,
} from '@untitledui/icons'
import { motion } from 'motion/react'
import type { ComponentType, ReactNode, SVGProps } from 'react'
import { CurrentTime } from '@/components/current-time'
import { Section } from '@/components/section'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Separator } from './ui/separator'

type InfoIcon = ComponentType<SVGProps<SVGSVGElement> & { color?: string; size?: number }>

type InfoItem = {
  icon: InfoIcon
  content: ReactNode
  href?: string
}

const currentRole = {
  icon: Code02,
  title: 'Software Engineer @',
  label: 'KVY Technology',
  href: 'https://kvytechnology.com/',
}

const informationItems: InfoItem[] = [
  {
    icon: MarkerPin01,
    content: 'Ho Chi Minh City, Viet Nam',
  },
  {
    icon: Clock,
    content: <CurrentTime />,
  },
  {
    icon: PhoneCall01,
    content: '0961 500 817',
    href: 'tel:+84961500817',
  },
  {
    icon: Mail01,
    content: 'lthieu9601@gmail.com',
    href: 'mailto:lthieu9601@gmail.com',
  },
  {
    icon: Link03,
    content: 'lthieu.dev',
    href: 'https://lthieu.dev',
  },
  {
    icon: User01,
    content: 'he/him',
  },
]

const socialLinks = [
  {
    href: 'https://github.com/lthieu96',
    label: 'GitHub',
    badge: 'github' as const,
  },
  {
    href: 'https://www.linkedin.com/in/l%C3%AA-trung-hi%E1%BA%BFu-20915b29a/',
    label: 'LinkedIn',
    badge: 'linkedin' as const,
  },
]

function InformationRow({
  icon: Icon,
  content,
  href,
  className,
}: InfoItem & { className?: string }) {
  const rowContent = (
    <div className={cn('flex items-center gap-4 font-mono text-sm', className)}>
      <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-muted-foreground/15 bg-muted ring-1 ring-border ring-offset-1 ring-offset-background [&_svg]:pointer-events-none [&_svg]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4">
        <Icon strokeWidth={1.8} />
      </div>
      <div className="min-w-0 text-balance text-foreground">{content}</div>
    </div>
  )

  if (!href) return rowContent

  const isExternal = href.startsWith('http')

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noreferrer' : undefined}
      className="block"
    >
      {rowContent}
    </a>
  )
}

function SocialBadge({ type }: { type: 'github' | 'linkedin' }) {
  if (type === 'github') {
    return (
      <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-foreground text-background">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
          <path d="M12 .5C5.648.5.5 5.648.5 12c0 5.094 3.292 9.387 7.86 10.91.575.104.785-.25.785-.556 0-.274-.01-1-.015-1.96-3.197.695-3.872-1.54-3.872-1.54-.523-1.326-1.277-1.678-1.277-1.678-1.044-.714.08-.699.08-.699 1.155.081 1.762 1.186 1.762 1.186 1.026 1.758 2.693 1.25 3.35.956.103-.743.402-1.25.73-1.538-2.552-.29-5.236-1.276-5.236-5.68 0-1.255.449-2.282 1.184-3.087-.119-.29-.513-1.457.112-3.038 0 0 .965-.309 3.16 1.179A10.98 10.98 0 0 1 12 6.07c.977.004 1.962.132 2.879.387 2.193-1.488 3.157-1.18 3.157-1.18.627 1.582.233 2.75.114 3.039.738.805 1.183 1.832 1.183 3.087 0 4.415-2.688 5.387-5.248 5.672.413.355.781 1.058.781 2.133 0 1.54-.014 2.781-.014 3.16 0 .309.207.665.79.552C20.21 21.384 23.5 17.093 23.5 12 23.5 5.648 18.352.5 12 .5Z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-[#0a66c2]/20 bg-[#0a66c2] text-white">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
        <path d="M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003zM7.119 20.452H3.555V9h3.564v11.452zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM20.447 20.452H16.89V14.87c0-1.332-.027-3.045-1.856-3.045-1.856 0-2.141 1.45-2.141 2.949v5.678H9.336V9h3.414v1.561h.049c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286z" />
      </svg>
    </div>
  )
}

export function InformationSection() {
  return (
    <Section>
      <div className="px-4 py-6 pb-5 sm:pb-6 sm:px-6 sm:py-8 overflow-hidden">
        <InformationRow
          icon={currentRole.icon}
          content={
            <p className="text-balance">
              {currentRole.title}
              <a
                className="ml-0.5 font-medium underline-offset-4 decoration-1 hover:underline"
                href={currentRole.href}
                target="_blank"
                rel="noreferrer"
              >
                {currentRole.label}
              </a>
            </p>
          }
          className="mb-4"
        />

        <div className="grid gap-x-12 gap-y-4 md:grid-cols-2">
          {informationItems.map((item) => (
            <InformationRow
              key={typeof item.content === 'string' ? item.content : item.href}
              {...item}
            />
          ))}
        </div>
        <Separator className="mt-6" />
        <div className="mt-4 flex items-stretch">
          {socialLinks.map((link, index) => (
            <div key={link.href} className="flex items-stretch">
              <Button asChild variant="ghost" size="lg">
                <motion.a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  initial="rest"
                  whileHover="hover"
                  animate="rest"
                >
                  <SocialBadge type={link.badge} />
                  <span className="font-sans">{link.label}</span>
                  <motion.span
                    className="ml-1 flex shrink-0"
                    variants={{
                      rest: { x: 0 },
                      hover: { x: 4 },
                    }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    <ArrowRight className="size-4" />
                  </motion.span>
                </motion.a>
              </Button>
              {index < socialLinks.length - 1 ? (
                <Separator orientation="vertical" className="mx-1 h-auto self-stretch" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
