"use client";

import { useRef, useState } from "react";
import { Heart, Play, ZoomIn } from "lucide-react";
import { cn } from "@/lib/cn";
import { Modal } from "@/components/ui/Modal";
import { videoSource } from "./video";

interface ProductGalleryProps {
  name: string;
  thumbImage: string;
  gallery: { id: string; image: string }[];
  videoLink?: string | null;
  badge?: string;
  wishlisted: boolean;
  wishlistBusy: boolean;
  onToggleWishlist: () => void;
}

const overlayBtn =
  "absolute flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink/75 shadow-md transition-colors hover:text-gold-dark disabled:opacity-50";

export function ProductGallery({ name, thumbImage, gallery, videoLink, badge, wishlisted, wishlistBusy, onToggleWishlist }: ProductGalleryProps) {
  const images = [thumbImage, ...gallery.map((g) => g.image).filter((src) => src !== thumbImage)];
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [video, setVideo] = useState(false);
  const scroller = useRef<HTMLUListElement>(null);
  const source = videoSource(videoLink);
  const current = images[index] ?? thumbImage;

  const onScroll = () => {
    const el = scroller.current;
    if (el && el.clientWidth > 0) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      <div className="relative min-w-0 flex-1">
        <div className="hidden aspect-[4/5] overflow-hidden bg-parchment lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current} alt={name} className="h-full w-full object-cover" />
        </div>
        <ul
          ref={scroller}
          onScroll={onScroll}
          aria-label={`${name} images`}
          tabIndex={0}
          className="flex aspect-[4/5] snap-x snap-mandatory overflow-x-auto bg-parchment [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, i) => (
            <li key={src} className="aspect-[4/5] w-full shrink-0 snap-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${name}, image ${i + 1} of ${images.length}`} loading={i === 0 ? "eager" : "lazy"} className="h-full w-full object-cover" />
            </li>
          ))}
        </ul>

        {badge && <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-[11px] font-medium text-white">{badge}</span>}
        <button
          type="button"
          onClick={onToggleWishlist}
          disabled={wishlistBusy}
          aria-pressed={wishlisted}
          aria-label={wishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          className={cn(overlayBtn, "right-3 top-3")}
        >
          <Heart className={cn("h-5 w-5", wishlisted && "fill-danger text-danger")} aria-hidden />
        </button>
        <button type="button" onClick={() => setZoom(true)} aria-label="Zoom image" className={cn(overlayBtn, "bottom-3 right-3")}>
          <ZoomIn className="h-5 w-5" aria-hidden />
        </button>
        {images.length > 1 && (
          <p aria-live="polite" className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 lg:hidden">
            <span className="sr-only">
              Image {index + 1} of {images.length}
            </span>
            {images.map((src, i) => (
              <span key={src} aria-hidden className={cn("h-1.5 rounded-full transition-all motion-reduce:transition-none", i === index ? "w-4 bg-gold" : "w-1.5 bg-white/80")} />
            ))}
          </p>
        )}
      </div>

      {(images.length > 1 || source) && (
        <ul aria-label="Product images" className="hidden gap-3 lg:flex lg:w-20 lg:flex-col">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1} of ${images.length}`}
                aria-pressed={index === i}
                className={cn("block aspect-square w-full overflow-hidden border transition-colors", index === i ? "border-gold" : "border-sand opacity-75 hover:opacity-100")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
          {source && (
            <li>
              <button type="button" onClick={() => setVideo(true)} aria-label="Play product video" className="flex aspect-square w-full items-center justify-center border border-sand bg-ink text-gold transition-colors hover:border-gold">
                <Play className="h-6 w-6 fill-current" aria-hidden />
              </button>
            </li>
          )}
        </ul>
      )}
      {source && (
        <button type="button" onClick={() => setVideo(true)} className="inline-flex items-center gap-2 self-start text-xs font-medium text-gold-dark underline underline-offset-2 lg:hidden">
          <Play className="h-3.5 w-3.5 fill-current" aria-hidden /> View video
        </button>
      )}

      <Modal open={zoom} onClose={() => setZoom(false)} title="A closer look" size="lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt={name} className="mx-auto max-h-[70vh] w-auto object-contain" />
      </Modal>
      <Modal open={video && !!source} onClose={() => setVideo(false)} title={`${name} in motion`} size="lg">
        {source?.kind === "iframe" ? (
          <iframe src={source.src} title={`${name} video`} allow="fullscreen; picture-in-picture" allowFullScreen className="aspect-video w-full" />
        ) : source ? (
          <video src={source.src} controls playsInline className="aspect-video w-full bg-ink-deep">
            <track kind="captions" />
          </video>
        ) : null}
      </Modal>
    </div>
  );
}
