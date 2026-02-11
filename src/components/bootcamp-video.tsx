'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VolumeX, Volume2, Expand } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BootcampVideoProps {
  src: string;
}

export function BootcampVideo({ src }: BootcampVideoProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  
  // Autoplay video when it becomes visible using a more robust method
  React.useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        try {
          if (entry.isIntersecting) {
            // When the video becomes visible, attempt to play it.
            await videoElement.play();
          } else {
            // When the video is no longer visible, pause it.
            videoElement.pause();
          }
        } catch (error) {
          // The play() request can be interrupted by a call to pause() when scrolling quickly.
          // This is expected behavior, so we can safely ignore the 'AbortError'.
          if ((error as DOMException).name !== 'AbortError') {
            console.error("Video playback error:", error);
          }
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the video is visible
    );

    observer.observe(videoElement);

    return () => {
      observer.unobserve(videoElement);
    };
  }, [src]); // Re-run effect if the video source changes

  // Function to handle stopping the video when the dialog closes
  React.useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      // We don't reset currentTime to allow it to resume from where it was
    }
  }, [isOpen]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dialog from opening
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      // If user unmutes, ensure video is playing
      videoRef.current.play().catch(console.error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div 
        className="relative aspect-video bg-muted rounded-lg overflow-hidden shadow-xl group"
      >
        <video
          className="w-full h-full object-cover"
          ref={videoRef}
          src={src}
          playsInline
          muted={isMuted} // Controlled by state
          loop
          autoPlay // Attempt autoplay on load
        >
          Your browser does not support the video tag.
        </video>
        <div 
          className={cn(
            "absolute bottom-2 left-2 right-2 flex items-center justify-between",
            "transition-opacity opacity-0 group-hover:opacity-100"
            )}
        >
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-black/50 hover:text-white"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            <span className="sr-only">Toggle Volume</span>
          </Button>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-black/50 hover:text-white"
            >
              <Expand className="w-5 h-5" />
              <span className="sr-only">Fullscreen</span>
            </Button>
          </DialogTrigger>
        </div>
      </div>
      <DialogContent className="max-w-4xl p-0 border-0 bg-black">
        <DialogHeader>
          <DialogTitle className="sr-only">Bootcamp Video</DialogTitle>
        </DialogHeader>
        <div className="aspect-video">
          <video
            className="w-full h-full"
            src={src}
            controls
            autoPlay
            playsInline
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
}
