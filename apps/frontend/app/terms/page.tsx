import type { Metadata } from "next";
import { PolicyPage, Pending } from "@/components/policy/PolicyPage";

export const metadata: Metadata = { title: "Terms & Conditions", description: "Terms of use for the Sawariya Jewels store." };

export default function TermsPage() {
  return <PolicyPage title="Terms & Conditions" sections={[{ heading: "Terms of use", body: <Pending text="Our terms and conditions are being finalised by the store." /> }]} />;
}
