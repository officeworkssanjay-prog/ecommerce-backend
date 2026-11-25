"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TrackLookup } from "@/components/track/TrackLookup";
import { TrackResult } from "@/components/track/TrackResult";
import type { TrackedOrder } from "@/components/track/trackTypes";

function OrderTrackContent() {
  const params = useSearchParams();
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const result = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (order) result.current?.focus();
  }, [order]);

  return (
    <div className="bg-cream">
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-3 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-dark">Your sparkle is on its way</p>
          <h1 className="font-serif text-3xl text-ink sm:text-4xl">Track your order</h1>
          <p className="mx-auto max-w-lg text-sm text-ink/60">Enter the invoice number from your confirmation and the email address used for the order.</p>
        </div>
        <TrackLookup initialInvoice={params.get("invoice") ?? params.get("invoiceId") ?? ""} onFound={setOrder} />
        {order && <TrackResult ref={result} order={order} />}
      </div>
    </div>
  );
}

export default function OrderTrackPage() {
  return (
    <Suspense fallback={null}>
      <OrderTrackContent />
    </Suspense>
  );
}
