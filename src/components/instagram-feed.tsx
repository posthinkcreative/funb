
'use client';

export function InstagramFeed() {
  return (
    <section className="py-12 bg-secondary/50">
      <div className="container mx-auto px-4">
         <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-8 text-accent">
          Follow Our Journey on Instagram
        </h2>
        <iframe 
          src="https://app.mirror-app.com/feed-instagram/ed08a833-28f6-4169-8661-995af5782e04/preview" 
          style={{ width: '100%', height: '500px', border: 'none', borderRadius: '8px' }}
          title="Instagram Feed Widget"
        ></iframe>
      </div>
    </section>
  );
}
