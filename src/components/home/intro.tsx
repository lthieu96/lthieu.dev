import { Link } from '@tanstack/react-router'
import { ArrowDownToLine, AtSign, Mail } from 'lucide-react'
import { Github, Linkedin } from '@/components/brand-icons'
import { delay } from '@/components/layout'
import { ThemeToggle } from '@/components/theme-toggle'
import { type SocialLink, site, socials } from '@/data/site'
import { external } from '@/lib/external'
import { Avatar } from './avatar'
import { ProductMention } from './product-mention'

const icons: Record<SocialLink['icon'], typeof Mail> = {
  mail: Mail,
  github: Github,
  linkedin: Linkedin,
  x: AtSign,
}

export function Intro() {
  return (
    <header className="flex flex-col gap-8">
      <div className="enter flex items-center justify-between" style={delay(0)}>
        <div className="flex items-center gap-3">
          <Avatar />
          <div>
            <h1 className="text-list font-medium text-fg">{site.name}</h1>
            <p className="text-ui text-muted">
              {site.role}
              {/* The intro right below says Saigon; drop it here on phones to keep one line. */}
              <span className="max-sm:hidden"> · {site.city}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/resume"
            className="flex items-center gap-1.5 rounded-full border border-line bg-well px-3 py-1.5 text-meta text-fg transition-[background-color,scale] duration-150 ease-(--ease-out) hover:bg-hover active:scale-[0.97]"
          >
            Resume
            <ArrowDownToLine size={13} aria-hidden className="text-muted" />
          </Link>
        </div>
      </div>

      {/* The links close the intro, so they sit closer to it than the intro sits to the header. */}
      <div className="flex flex-col gap-5">
        <div className="enter flex flex-col gap-4 text-body text-muted" style={delay(1)}>
          <p>
            I'm Hieu, a full-stack developer in {site.city}. I build products end to end: web apps,
            mobile apps, and the backend that keeps them running. Right now I'm at KVY Technology,
            working on <ProductMention slug="sway" />, an app that turns crypto news into cards you
            can swipe and take a side on.
          </p>
          <p>
            Before that, I built <ProductMention slug="cerebro" />, which shows all your crypto in
            one place, and <ProductMention slug="benkon" />, apps to control office devices and book
            meeting rooms.
          </p>
        </div>

        <ul className="enter flex flex-wrap items-center gap-x-5 gap-y-2" style={delay(2)}>
          {socials.map(({ label, href, icon }) => {
            const Icon = icons[icon]
            return (
              <li key={label}>
                <a
                  href={href}
                  {...external(href)}
                  className="group flex items-center gap-1.5 text-ui text-muted transition-colors duration-150 hover:text-fg"
                >
                  <Icon
                    size={14}
                    aria-hidden
                    className="text-subtle transition-colors duration-150 group-hover:text-fg"
                  />
                  {label}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </header>
  )
}
