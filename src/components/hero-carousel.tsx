
"use client"

import * as React from "react"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"

const heroImages = [
  { src: "/hero-1.jpg?v=1", alt: "Hero Image 1", hint: "online learning", href: "/courses" },
  { src: "/hero-2.jpg?v=1", alt: "Hero Image 2", hint: "students collaborating", href: "/courses" },
  { src: "/hero-3.jpg?v=1", alt: "Hero Image 3", hint: "digital classroom", href: "/courses" },
]

export function HeroCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true, stopOnFocusIn: true })
  )
  const [api, setApi] = React.useState<CarouselApi>()
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const sectionRef = React.useRef<HTMLDivElement>(null)
  const [isIntersecting, setIsIntersecting] = React.useState(false)
  const router = useRouter()


  React.useEffect(() => {
    if (!api) return;

    // Set initial slide
    setCurrentSlide(api.selectedScrollSnap())

    // Listen for slide changes
    const onSelect = () => {
      setCurrentSlide(api.selectedScrollSnap())
    }
    api.on("select", onSelect)


    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.1 }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      api.off("select", onSelect)
    };
  }, [api]);

  React.useEffect(() => {
    if (!api || !plugin.current) return;

    if (isIntersecting) {
      if (!plugin.current.isPlaying()) {
        plugin.current.play();
      }
    } else {
      plugin.current.stop();
    }
  }, [api, isIntersecting, plugin]);

  const handleButtonClick = () => {
    const currentHref = heroImages[currentSlide]?.href
    if(currentHref) {
      router.push(currentHref);
    }
  }


  return (
    <section className="w-full relative" ref={sectionRef}>
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={() => plugin.current?.stop()}
        onMouseLeave={() => plugin.current?.play()}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent className="ml-0">
          {heroImages.map((image, index) => (
            <CarouselItem key={index} className="pl-0 basis-full">
              <div className="relative w-full aspect-video bg-black">
                <Image
                  src={image.src}
                  alt={image.alt}
                  data-ai-hint={image.hint}
                  fill
                  style={{ objectFit: "contain" }}
                  priority={index === 0}
                  sizes="100vw"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="absolute bottom-6 left-6 z-10">
          <Button size="lg" onClick={handleButtonClick} className="bg-black hover:bg-gray-800 text-white">Buy Now</Button>
      </div>
    </section>
  )
}
