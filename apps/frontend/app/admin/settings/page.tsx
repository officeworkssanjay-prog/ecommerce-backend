"use client";

import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import type { AdminSettings } from "@/lib/types";
import { ErrorState, PageLoader } from "@/components/ui/States";
import { PageHeader } from "@/components/admin/AdminKit";
import { GeneralSection } from "@/components/admin/settings/GeneralSection";
import { EmailSection } from "@/components/admin/settings/EmailSection";
import { PusherSection } from "@/components/admin/settings/PusherSection";
import { PaymentsSection } from "@/components/admin/settings/PaymentsSection";

export default function SettingsPage() {
  const { data, loading, error, message, reload } = useApi(async () => (await api.get<AdminSettings>("/admin/settings")).data);

  if (loading && !data) return <PageLoader />;
  if (error || !data) return <ErrorState message={message} onRetry={reload} />;

  return (
    <div>
      <PageHeader title="Settings" description="Store details, outgoing email, realtime and payment methods." />
      <div className="grid max-w-4xl gap-6">
        <GeneralSection value={data.general} onSaved={reload} />
        <PaymentsSection value={data.paymentGateways} onSaved={reload} />
        <EmailSection value={data.email} onSaved={reload} />
        <PusherSection value={data.pusher} onSaved={reload} />
      </div>
    </div>
  );
}
