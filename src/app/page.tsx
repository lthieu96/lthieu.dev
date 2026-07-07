import { AboutTechnical } from '@/components/about-technical'
import { ContactTechnical } from '@/components/contact-technical'
import { ExperienceTechnical } from '@/components/experience-technical'
import { Hero } from '@/components/hero'
import { Marquee } from '@/components/marquee'
import { WorksTechnical } from '@/components/works-technical'

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <AboutTechnical />
      <WorksTechnical />
      <ExperienceTechnical />
      <ContactTechnical />
    </>
  )
}
