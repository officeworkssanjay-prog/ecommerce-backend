import { Star } from "lucide-react";

export function StarRating({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex" role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} aria-hidden className={`${size} ${i <= rounded ? "fill-gold text-gold" : "text-sand"}`} />
      ))}
    </span>
  );
}
