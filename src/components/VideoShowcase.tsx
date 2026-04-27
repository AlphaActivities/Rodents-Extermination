import { useRef, useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';

const videos = [
  {
    src: '/videos/in_action.MP4',
    title: 'Juan In Action',
    description: 'Watch Juan at work during a real attic job. The same person you speak with on the phone is the one doing the work.',
  },
  {
    src: '/videos/Sucking_up.MP4',
    title: 'Attic Cleanup In Progress',
    description: 'Real footage of the removal process: old insulation, debris, and contaminated material being extracted from a DFW attic.',
  },
  {
    src: '/videos/finish.MP4',
    title: 'Finishing The Job',
    description: 'The final stage of an insulation installation. Sealing and padding applied from a sky lift to lock in the work properly.',
  },
];

const delayClasses = ['', 'reveal-delay-1', 'reveal-delay-2'] as const;

function VideoCard({ video, index, parentVisible }: { video: typeof videos[0]; index: number; parentVisible: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    // Fired on all browsers when fullscreen exits
    function onFullscreenChange() {
      const fsEl =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;

      if (!fsEl) {
        el!.pause();
        el!.currentTime = 0;
        setPlaying(false);
      }
    }

    // iOS fires this on the video element itself
    function onWebkitEndFullscreen() {
      el!.pause();
      el!.currentTime = 0;
      setPlaying(false);
    }

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);
    document.addEventListener('mozfullscreenchange', onFullscreenChange);
    document.addEventListener('MSFullscreenChange', onFullscreenChange);
    el.addEventListener('webkitendfullscreen', onWebkitEndFullscreen);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      document.removeEventListener('mozfullscreenchange', onFullscreenChange);
      document.removeEventListener('MSFullscreenChange', onFullscreenChange);
      el.removeEventListener('webkitendfullscreen', onWebkitEndFullscreen);
    };
  }, []);

  function handlePlay() {
    const el = videoRef.current;
    if (!el) return;

    el.play().then(() => {
      setPlaying(true);

      // iOS Safari: use webkitEnterFullscreen directly on the video element
      if ((el as any).webkitEnterFullscreen) {
        (el as any).webkitEnterFullscreen();
        return;
      }

      // All other browsers
      const requestFS =
        el.requestFullscreen?.bind(el) ||
        (el as any).webkitRequestFullscreen?.bind(el) ||
        (el as any).mozRequestFullScreen?.bind(el) ||
        (el as any).msRequestFullscreen?.bind(el);

      if (requestFS) requestFS().catch(() => {});
    }).catch(() => {});
  }

  function handlePause() {
    setPlaying(false);
  }

  function handleEnded() {
    setPlaying(false);
  }

  return (
    <div className={`bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm video-card-hover flex flex-col reveal ${delayClasses[index]} ${parentVisible ? 'reveal-visible' : ''}`}>
      <div className="relative h-52 bg-neutral-900 overflow-hidden group">
        {/* Index badge */}
        <div className="absolute top-3 left-3 w-7 h-7 bg-brand-500 rounded-md flex items-center justify-center z-10 pointer-events-none">
          <span className="text-white font-bold text-xs">{index + 1}</span>
        </div>

        {/* Video element — controls shown in fullscreen via browser/OS UI */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          preload="metadata"
          playsInline
          onPause={handlePause}
          onEnded={handleEnded}
          aria-label={video.title}
        >
          <source src={video.src} type="video/mp4" />
        </video>

        {/* Center play overlay — hidden once playing */}
        {!playing && (
          <button
            onClick={handlePlay}
            aria-label={`Play ${video.title}`}
            className="absolute inset-0 flex items-center justify-center bg-neutral-950/40 group-hover:bg-neutral-950/30 transition-colors duration-200"
          >
            <span className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-200">
              <Play className="w-7 h-7 text-brand-500 ml-1" fill="currentColor" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-neutral-900 mb-2">{video.title}</h3>
        <p className="text-neutral-500 text-sm leading-relaxed flex-1">{video.description}</p>
      </div>
    </div>
  );
}

export default function VideoShowcase() {
  const { ref: headerRef, visible: headerVisible } = useReveal();
  const { ref: cardsRef, visible: cardsVisible } = useReveal();
  const { ref: bridgeRef, visible: bridgeVisible } = useReveal();

  return (
    <section id="gallery" className="py-20 sm:py-28 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={`text-center mb-16 reveal ${headerVisible ? 'reveal-visible' : ''}`}
        >
          <p className="section-label mb-3">Project Videos</p>
          <h2 className="section-heading mb-4">
            Watch The Work Behind The Results
          </h2>
          <p className="section-subheading mx-auto">
            Real project footage from DFW attic jobs.
          </p>
        </div>

        <div
          ref={cardsRef as React.RefObject<HTMLDivElement>}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {videos.map((video, i) => (
            <VideoCard key={video.src} video={video} index={i} parentVisible={cardsVisible} />
          ))}
        </div>

        <div
          ref={bridgeRef as React.RefObject<HTMLDivElement>}
          className={`mt-12 border-t border-neutral-200 pt-10 text-center reveal ${bridgeVisible ? 'reveal-visible' : ''}`}
        >
          <p className="text-neutral-500 text-base mb-1">Every job is done by the same person you speak with on the phone.</p>
          <p className="text-neutral-400 text-sm">Here is what that means for the homeowners we work with.</p>
        </div>
      </div>
    </section>
  );
}
