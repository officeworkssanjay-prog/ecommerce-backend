export type VideoSource = { kind: "iframe"; src: string } | { kind: "file"; src: string };

/** Turns a product's `videoLink` into something embeddable (YouTube/Vimeo iframe or a direct video file). */
export function videoSource(link: string | null | undefined): VideoSource | null {
  if (!link) return null;
  try {
    const url = new URL(link, "https://placeholder.invalid");
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return { kind: "iframe", src: `https://www.youtube.com/embed${url.pathname}` };
    if (host.endsWith("youtube.com")) {
      const id = url.searchParams.get("v") ?? url.pathname.split("/").filter(Boolean).pop();
      return id ? { kind: "iframe", src: `https://www.youtube.com/embed/${id}` } : null;
    }
    if (host === "vimeo.com") return { kind: "iframe", src: `https://player.vimeo.com/video${url.pathname}` };
    return { kind: "file", src: link };
  } catch {
    return null;
  }
}
