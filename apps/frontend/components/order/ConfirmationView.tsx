import Link from "next/link";
import { Check, Clock, XCircle } from "lucide-react";
import type { Order } from "@/lib/types";
import { formatDateTime, humanize } from "@/lib/format";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { OrderDetails } from "./OrderDetails";

const STAGES = ["Confirmed", "Packed", "Shipped", "Delivered"] as const;

function stageIndex(status: Order["orderStatus"]): number {
  switch (status) {
    case "PENDING":
      return 0;
    case "PROCESSED_AND_READY_TO_SHIP":
      return 1;
    case "DELIVERED":
      return 3;
    default:
      return 2;
  }
}

/** Only an order the API reports as placed is shown; online orders that are still unpaid are labelled as such. */
export function ConfirmationView({ order, firstName }: { order: Order; firstName?: string }) {
  const cancelled = order.orderStatus === "CANCELED";
  const awaitingPayment = !cancelled && order.paymentMethod === "RAZORPAY" && order.paymentStatus === "UNPAID";
  const current = stageIndex(order.orderStatus);
  const trackHref = `/order-track?invoiceId=${order.invoiceId}&invoice=${order.invoiceId}`;
  const Icon = cancelled ? XCircle : awaitingPayment ? Clock : Check;

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-5xl space-y-8 px-4 py-12 sm:px-6 lg:py-16">
        <header className="space-y-3 text-center" role="status">
          <span className={cn("mx-auto flex h-14 w-14 items-center justify-center rounded-full text-ink-deep", cancelled ? "bg-sand" : awaitingPayment ? "bg-sand" : "bg-gold")}>
            <Icon className="h-7 w-7" aria-hidden />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">{cancelled ? "Order cancelled" : awaitingPayment ? "Payment pending" : "A little sparkle is on its way"}</p>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">{cancelled ? "This order was cancelled" : awaitingPayment ? "We're waiting for your payment" : `Thank you${firstName ? `, ${firstName}` : ""}!`}</h1>
          <p className="text-sm text-ink/70">
            Order <strong className="text-ink">#{order.invoiceId}</strong>
            {cancelled ? " was cancelled." : awaitingPayment ? " is reserved until the payment is confirmed." : " is confirmed."} Placed on {formatDateTime(order.createdAt)}.
          </p>
          {order.user?.email && !cancelled && <p className="text-xs text-ink/60">We&apos;ve recorded this order against {order.user.email}.</p>}
        </header>

        {!cancelled && (
          <section aria-label="Order status" className="rounded-md bg-white p-6">
            <h2 className="font-serif text-2xl text-ink">{humanize(order.orderStatus)}</h2>
            <ol className="mt-5 grid grid-cols-4 gap-2" aria-label="Order progress">
              {STAGES.map((label, i) => (
                <li key={label} aria-current={i === current ? "step" : undefined} className="space-y-2 text-center text-xs">
                  <div className={cn("h-1.5 rounded-full", i <= current ? "bg-gold" : "bg-sand")} aria-hidden />
                  <span className={i <= current ? "font-semibold text-ink" : "text-ink/50"}>{label}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href={trackHref} className={buttonClasses("primary", "lg", "w-full sm:w-auto")}>
                Track order
              </Link>
              <Link href="/products" className={buttonClasses("outline", "lg", "w-full sm:w-auto")}>
                Continue shopping
              </Link>
            </div>
          </section>
        )}
        {cancelled && (
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/products" className={buttonClasses("primary", "lg")}>
              Continue shopping
            </Link>
          </div>
        )}

        <OrderDetails order={order} />
      </div>
    </div>
  );
}
