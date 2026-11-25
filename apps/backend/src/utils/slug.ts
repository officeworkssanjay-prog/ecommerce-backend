export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80)
      .replace(/-+$/g, "") || "item"
  );
}

/** Readable slug ("royal-kundan-choker"); appends -2, -3 … only when the plain slug is already taken. */
export async function uniqueSlug(text: string, isTaken: (slug: string) => Promise<boolean>): Promise<string> {
  const base = slugify(text);
  let slug = base;
  for (let i = 2; await isTaken(slug); i++) slug = `${base}-${i}`;
  return slug;
}
