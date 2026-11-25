import type { Metadata } from "next";
import { PolicyPage, InlineLink, ContactLink } from "@/components/policy/PolicyPage";

export const metadata: Metadata = { title: "FAQs", description: "Answers about payments, shipping charges, order tracking and your account." };

export default function FaqsPage() {
  return (
    <PolicyPage
      title="Frequently Asked Questions"
      sections={[
        { heading: "Which payment methods do you accept?", body: <p>You can pay online through Razorpay or choose Cash on Delivery (COD) at checkout.</p> },
        {
          heading: "How much does shipping cost?",
          body: <p>Shipping is free on orders above ₹499. Otherwise, Standard shipping is ₹49 and Express shipping is ₹99.</p>,
        },
        {
          heading: "How do I track my order?",
          body: (
            <p>
              Visit <InlineLink href="/order-track">Track Order</InlineLink> to check the status of your order.
            </p>
          ),
        },
        {
          heading: "How do I create an account?",
          body: (
            <p>
              You can <InlineLink href="/register">register here</InlineLink>. If you already have an account, <InlineLink href="/login">sign in</InlineLink>.
            </p>
          ),
        },
        {
          heading: "How do I save items to a wishlist?",
          body: (
            <p>
              Sign in and save products you like. You can view them any time in your <InlineLink href="/account/wishlist">wishlist</InlineLink>.
            </p>
          ),
        },
        {
          heading: "Something else?",
          body: (
            <p>
              Please <ContactLink /> and we will help.
            </p>
          ),
        },
      ]}
    />
  );
}
