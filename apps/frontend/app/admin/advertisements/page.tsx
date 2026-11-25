"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateAdvertisementSchema } from "@ecommerce/shared-types";
import type { z } from "zod";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import { useApi } from "@/lib/useApi";
import { humanize } from "@/lib/format";
import type { Advertisement } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Checkbox, FormError, Input } from "@/components/ui/Field";
import { ErrorState, PageLoader } from "@/components/ui/States";
import { useFeedback } from "@/components/ui/Feedback";
import { PageHeader } from "@/components/admin/AdminKit";
import { ImageUpload } from "@/components/ImageUpload";

type In = z.input<typeof UpdateAdvertisementSchema>;
type Out = z.output<typeof UpdateAdvertisementSchema>;

const STARTER_KEYS = ["homepage_banner_section_one", "productpage_banner"];

function SlotForm({ slotKey, ad, onSaved }: { slotKey: string; ad?: Advertisement; onSaved: () => void }) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<In, unknown, Out>({
    resolver: zodResolver(UpdateAdvertisementSchema),
    defaultValues: { key: slotKey, value: { banner: ad?.value.banner ?? null, url: ad?.value.url ?? "", status: ad?.value.status ?? true } },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await api.put("/admin/advertisements", values);
      toast.success("Banner saved");
      onSaved();
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  return (
    <form onSubmit={submit} noValidate aria-label={`Banner slot ${humanize(slotKey)}`} className="grid gap-4 rounded-lg border border-sand bg-white p-5">
      <h2 className="font-serif text-lg text-ink">{humanize(slotKey.replace(/_/g, " "))}</h2>
      <p className="-mt-3 font-mono text-xs text-ink/50">{slotKey}</p>
      <FormError message={formError} />
      <input type="hidden" {...register("key")} />
      <Controller
        control={control}
        name="value.banner"
        render={({ field }) => <ImageUpload label="Banner image" value={field.value} onChange={field.onChange} error={errors.value?.banner?.message} />}
      />
      <Input label="Link" placeholder="/products or https://..." hint="A site path or full https URL" error={errors.value?.url?.message} {...register("value.url")} />
      <Checkbox label="Show this banner" {...register("value.status")} />
      <div>
        <Button type="submit" loading={isSubmitting}>
          Save banner
        </Button>
      </div>
    </form>
  );
}

export default function AdvertisementsPage() {
  const { data, loading, error, message, reload } = useApi(async () => (await api.get<Advertisement[]>("/admin/advertisements")).data);
  if (loading && !data) return <PageLoader />;
  if (error) return <ErrorState message={message} onRetry={reload} />;

  const ads = data ?? [];
  const keys = [...new Set([...ads.map((a) => a.key), ...STARTER_KEYS])];

  return (
    <div>
      <PageHeader title="Advertisements" description="Promotional banners placed on the storefront. Each slot has its own image, link and visibility." />
      <div className="grid gap-6 lg:grid-cols-2">
        {keys.map((k) => {
          const ad = ads.find((a) => a.key === k);
          return <SlotForm key={`${k}-${ad?.id ?? "new"}`} slotKey={k} ad={ad} onSaved={reload} />;
        })}
      </div>
    </div>
  );
}
