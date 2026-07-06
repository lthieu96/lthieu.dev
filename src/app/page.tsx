import { AboutEditorial } from '@/components/about-editorial'
import { ContactCta } from '@/components/contact-cta'
import { ExperienceEditorial } from '@/components/experience-editorial'
import { Hero } from '@/components/hero'
import { Marquee } from '@/components/marquee'
import { WorksEditorial } from '@/components/works-editorial'

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <AboutEditorial />
      <WorksEditorial />
      <ExperienceEditorial />
      <ContactCta />
    </>
  )
}
