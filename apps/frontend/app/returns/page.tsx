import type { Metadata } from "next";
import { PolicyPage, Pending } from "@/components/policy/PolicyPage";

export const metadata: Metadata = { title: "Returns", description: "Returns and refunds information for Sawariya Jewels orders." };

export default function ReturnsPage() {
  return <PolicyPage title="Returns" sections={[{ heading: "Returns and refunds", body: <Pending text="Our returns and refunds policy is being finalised by the store." /> }]} />;
}
