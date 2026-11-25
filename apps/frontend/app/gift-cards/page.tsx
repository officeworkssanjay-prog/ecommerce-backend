import type { Metadata } from "next";
import { PolicyPage, ContactLink } from "@/components/policy/PolicyPage";

export const metadata: Metadata = { title: "Gift Cards", description: "Gift cards at Sawariya Jewels." };

export default function GiftCardsPage() {
  return (
    <PolicyPage
      title="Gift Cards"
      sections={[
        {
          heading: "Coming soon",
          body: (
            <p>
              Gift cards are not available yet. For questions please <ContactLink />.
            </p>
          ),
        },
      ]}
    />
  );
}
