
'use client';

export function InstagramFeed() {
  return (
    <section className="py-12 bg-secondary/50">
      <div className="container mx-auto px-4">
         <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-8 text-accent">
          Follow Our Journey on Instagram
        </h2>
        <div className="relative">
          <iframe 
            src="https://app.mirror-app.com/feed-instagram/ed08a833-28f6-4169-8661-995af5782e04/preview" 
            className="w-full h-[950px] md:h-[600px] border-none rounded-lg"
            title="Instagram Feed Widget"
            scrolling="no"
          ></iframe>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-background z-10"></div>
        </div>
      </div>
    </section>
  );
}
