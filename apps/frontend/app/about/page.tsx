import type { Metadata } from "next";
import { BrandStory } from "@/components/home/BrandStory";

export const metadata: Metadata = {
  title: "Our Story",
  description: "Sawariya Jewels brings together master artisans and modern design to make luxury accessible to every woman.",
};

export default function AboutPage() {
  return <BrandStory cta={false} headingLevel="h1" />;
}
