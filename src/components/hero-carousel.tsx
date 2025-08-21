
"use client"

import * as React from "react"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

const heroImages = [
  { src: "/hero-1.jpg?v=1", alt: "Hero Image 1", hint: "online learning" },
  { src: "/hero-2.jpg?v=1", alt: "Hero Image 2", hint: "students collaborating" },
  { src: "/hero-3.jpg?v=1", alt: "Hero Image 3", hint: "digital classroom" },
]

export function HeroCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true, stopOnFocusIn: true })
  )
  const [api, setApi] = React.useState<CarouselApi>()
  const [isIntersecting, setIsIntersecting] = React.useState(false)
  const sectionRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])
  
  React.useEffect(() => {
    if (!api) return;

    if (isIntersecting) {
        // If the carousel is visible and autoplay is not playing, start it.
        if (!plugin.current.isPlaying()) {
            plugin.current.play();
        }
    } else {
        // If the carousel is not visible, stop autoplay.
        plugin.current.stop();
    }
  }, [api, isIntersecting]);


  return (
    <section className="w-full relative" ref={sectionRef}>
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.play}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {heroImages.map((image, index) => (
            <CarouselItem key={index} className="p-0">
              <div className="relative w-full h-[300px] md:h-[500px] lg:h-[600px]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  data-ai-hint={image.hint}
                  fill
                  style={{ objectFit: "cover" }}
                  priority={index === 0}
                  sizes="100vw"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
