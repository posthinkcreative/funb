
'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { companyLogos } from '@/lib/config';

export function CompanyLogos() {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const sectionRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
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
    };
  }, []);


  return (
    <section className="py-12 bg-background" ref={sectionRef}>
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-accent mb-8 max-w-2xl mx-auto">
          We are Proud to Help Thousands of Our Students Land Jobs at Top Companies Like These
        </h2>
        <div
          className="relative w-full overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
          }}
        >
          <div 
            className={cn(
              "flex animate-scroll",
              !isIntersecting && "paused"
            )}
            style={{ animationPlayState: isIntersecting ? 'running' : 'paused' }}
          >
             {/* Duplicate logos for seamless loop */}
            {[...companyLogos, ...companyLogos].map((logo, index) => (
              <div key={index} className="flex-shrink-0 mx-4" style={{ width: '150px' }}>
                <Image
                  src={logo.src}
                  alt={`${logo.name} logo`}
                  width={120}
                  height={40}
                  className="object-contain h-10 w-full"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
