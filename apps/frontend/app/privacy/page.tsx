import type { Metadata } from "next";
import { PolicyPage, Pending } from "@/components/policy/PolicyPage";

export const metadata: Metadata = { title: "Privacy Policy", description: "Privacy information for Sawariya Jewels customers." };

export default function PrivacyPage() {
  return <PolicyPage title="Privacy Policy" sections={[{ heading: "Your privacy", body: <Pending text="Our privacy policy is being finalised by the store." /> }]} />;
}
