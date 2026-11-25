"use client";

import Link from "next/link";
import { BadgeCheck, Clock, Wallet, Package, ShoppingBag, Users } from "lucide-react";
import type { ComponentType } from "react";
import { api } from "@/lib/api";
import { formatDateTime, formatMoney, humanize } from "@/lib/format";
import type { Order } from "@/lib/types";
import { useApi } from "@/lib/useApi";
import { Badge, orderStatusTone } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { ErrorState, PageLoader } from "@/components/ui/States";
import { DataTable, PageHeader } from "@/components/admin/AdminKit";
import type { Column } from "@/components/admin/AdminKit";

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

const QUICK_LINKS = [
  { href: "/admin/orders", label: "Manage orders" },
  { href: "/admin/products", label: "Add or edit products" },
  { href: "/admin/reviews", label: "Moderate reviews" },
  { href: "/admin/users", label: "Customers" },
];

function StatCard({ label, value, icon: Icon, hint }: { label: string; value: string; icon: ComponentType<{ className?: string }>; hint?: string }) {
  return (
    <div className="rounded-lg border border-sand bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink/60">{label}</p>
        <Icon className="h-5 w-5 text-gold-dark" aria-hidden />
      </div>
      <p className="mt-2 font-serif text-3xl text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink/55">{hint}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const stats = useApi(async () => (await api.get<DashboardStats>("/admin/dashboard")).data);
  const recent = useApi(async () => (await api.get<Order[]>("/admin/orders")).data.slice(0, 5));

  const columns: Column<Order>[] = [
    { key: "invoice", header: "Order", render: (o) => <span className="font-medium">#{o.invoiceId}</span> },
    { key: "customer", header: "Customer", render: (o) => o.user?.name ?? "-" },
    { key: "date", header: "Placed", render: (o) => formatDateTime(o.createdAt) },
    { key: "amount", header: "Total", render: (o) => formatMoney(o.amount) },
    { key: "status", header: "Status", render: (o) => <Badge tone={orderStatusTone(o.orderStatus)}>{humanize(o.orderStatus)}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="How the store is doing right now." />

      {stats.loading && !stats.data ? (
        <PageLoader label="Loading dashboard…" className="py-12" />
      ) : stats.message && !stats.data ? (
        <ErrorState message={stats.message} onRetry={stats.reload} />
      ) : stats.data ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Revenue" value={formatMoney(stats.data.totalRevenue)} icon={Wallet} hint="Paid orders only" />
          <StatCard label="Orders" value={String(stats.data.totalOrders)} icon={ShoppingBag} />
          <StatCard label="Pending orders" value={String(stats.data.pendingOrders)} icon={Clock} hint="Waiting to be processed" />
          <StatCard label="Active products" value={String(stats.data.totalProducts)} icon={Package} />
          <StatCard label="Customers" value={String(stats.data.totalUsers)} icon={Users} />
        </div>
      ) : null}

      <section aria-labelledby="recent-orders" className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="recent-orders" className="font-serif text-xl text-ink">
            Recent orders
          </h2>
          <Link href="/admin/orders" className="text-sm font-medium text-gold-dark hover:underline">
            View all
          </Link>
        </div>
        {recent.message && !recent.data ? (
          <ErrorState message={recent.message} onRetry={recent.reload} />
        ) : (
          <DataTable columns={columns} rows={recent.data} loading={recent.loading && !recent.data} emptyTitle="No orders yet" emptyDescription="New orders will show up here." />
        )}
      </section>

      <section aria-labelledby="quick-links" className="mt-8">
        <h2 id="quick-links" className="mb-3 font-serif text-xl text-ink">
          Quick links
        </h2>
        <div className="flex flex-wrap gap-3">
          {QUICK_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={buttonClasses("outline")}>
              <BadgeCheck className="h-4 w-4" aria-hidden /> {l.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
