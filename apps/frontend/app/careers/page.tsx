import type { Metadata } from "next";
import { PolicyPage, ContactLink } from "@/components/policy/PolicyPage";

export const metadata: Metadata = { title: "Careers", description: "Careers at Sawariya Jewels." };

export default function CareersPage() {
  return (
    <PolicyPage
      title="Careers"
      sections={[
        {
          heading: "Open positions",
          body: (
            <p>
              There are no openings listed at the moment. If you would like to get in touch with us, please <ContactLink />.
            </p>
          ),
        },
      ]}
    />
  );
}
