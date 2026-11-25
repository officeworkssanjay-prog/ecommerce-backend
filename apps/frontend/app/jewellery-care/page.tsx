import type { Metadata } from "next";
import { PolicyPage, Pending } from "@/components/policy/PolicyPage";

export const metadata: Metadata = { title: "Jewellery Care", description: "Care guidance for your Sawariya Jewels pieces." };

export default function JewelleryCarePage() {
  return (
    <PolicyPage
      title="Jewellery Care"
      intro="Our pieces are hand-crafted by skilled artisans."
      sections={[{ heading: "Care guidance", body: <Pending text="Detailed care guidance is being finalised by the store." /> }]}
    />
  );
}
