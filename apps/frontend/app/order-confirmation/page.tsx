"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import type { Order } from "@/lib/types";
import { buttonClasses } from "@/components/ui/Button";
import { EmptyState, ErrorState, PageLoader } from "@/components/ui/States";
import { ConfirmationView } from "@/components/order/ConfirmationView";

function Confirmation() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params.get("order");
  const invoice = params.get("invoice");
  const { user, loading: authLoading } = useAuth();
  const next = `/order-confirmation?${params.toString()}`;

  useEffect(() => {
    if (!authLoading && !user) router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [authLoading, user, router, next]);

  const orders = useApi(async () => (await api.get<Order[]>("/order/user/orders")).data, [], { enabled: !!user });

  if (authLoading || !user || (orders.loading && !orders.data)) return <PageLoader label="Loading your order…" />;
  if (orders.error && !orders.data) return <ErrorState message={orders.message} onRetry={orders.reload} />;

  const order = orders.data?.find((o) => (orderId ? o.id === orderId : false) || (!orderId && invoice ? String(o.invoiceId) === invoice : false));
  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4">
        <EmptyState
          title="We couldn't find that order"
          description="Check your orders list to see everything you've placed."
          action={
            <Link href="/account/orders" className={buttonClasses("primary", "md")}>
              View my orders
            </Link>
          }
        />
      </div>
    );
  }
  return <ConfirmationView order={order} firstName={user.name.split(" ")[0]} />;
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading your order…" />}>
      <Confirmation />
    </Suspense>
  );
}
