import type { Metadata } from "next";
import { PolicyPage, Pending, InlineLink } from "@/components/policy/PolicyPage";

export const metadata: Metadata = { title: "Shipping", description: "Shipping charges and order tracking at Sawariya Jewels." };

export default function ShippingPage() {
  return (
    <PolicyPage
      title="Shipping"
      sections={[
        {
          heading: "Shipping charges",
          body: (
            <ul className="list-disc space-y-1 pl-5">
              <li>Free shipping on orders above ₹499.</li>
              <li>Standard shipping: ₹49.</li>
              <li>Express shipping: ₹99.</li>
            </ul>
          ),
        },
        {
          heading: "Track your order",
          body: (
            <p>
              Once you have placed an order you can follow it at <InlineLink href="/order-track">Track Order</InlineLink>.
            </p>
          ),
        },
        { heading: "Delivery times", body: <Pending text="Delivery timelines are being finalised by the store." /> },
      ]}
    />
  );
}
