"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import type { Address } from "@/lib/types";
import { AddressForm } from "@/components/account/AddressForm";
import { Button } from "@/components/ui/Button";
import { ErrorState, PageLoader } from "@/components/ui/States";
import { useFeedback } from "@/components/ui/Feedback";
import { cn } from "@/lib/cn";

interface Props {
  addresses: Address[] | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onContinue: () => void;
  userName?: string;
  userEmail?: string;
}

const MAX_ADDRESSES = 10;

export function AddressStep({ addresses, loading, error, reload, selectedId, onSelect, onContinue, userName, userEmail }: Props) {
  const { toast } = useFeedback();
  const [adding, setAdding] = useState(false);

  if (loading && !addresses) return <PageLoader label="Loading your addresses…" className="py-10" />;
  if (error && !addresses) return <ErrorState message={error} onRetry={reload} />;

  const list = addresses ?? [];
  const showForm = adding || list.length === 0;

  const save = async (values: Parameters<React.ComponentProps<typeof AddressForm>["onSave"]>[0]) => {
    const res = await api.post<Address>("/user/addresses", values);
    toast.success("Address saved");
    reload();
    onSelect(res.data.id);
    setAdding(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink/70">Choose where your jewellery should arrive.</p>
      {list.length > 0 && (
        <div role="radiogroup" aria-label="Delivery address" className="space-y-3">
          {list.map((a) => {
            const active = a.id === selectedId;
            return (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onSelect(a.id)}
                className={cn("flex w-full items-start gap-3 rounded-md border p-4 text-left text-sm transition-colors", active ? "border-gold bg-parchment" : "border-sand bg-white hover:bg-parchment/50")}
              >
                <span aria-hidden className={cn("mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border", active ? "border-gold" : "border-ink/40")}>
                  {active && <span className="h-2 w-2 rounded-full bg-gold" />}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-ink">
                    {a.name} · {a.addressType === "office" ? "Work" : "Home"}
                    {a.isDefault && <span className="ml-2 rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-gold-dark">Default</span>}
                  </span>
                  <span className="mt-1 block text-ink/70">
                    {a.address}, {a.city}, {a.state} {a.zipCode}, {a.country}
                  </span>
                  <span className="mt-1 block text-ink/60">{a.phone}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {showForm ? (
        <div className="rounded-md border border-sand bg-white p-4">
          <h3 className="mb-3 font-serif text-lg text-ink">{list.length === 0 ? "Add a delivery address" : "New address"}</h3>
          <AddressForm
            onSave={save}
            onCancel={list.length > 0 ? () => setAdding(false) : undefined}
            allowDefault={list.length > 0}
            submitLabel="Save & deliver here"
            defaults={{ name: userName ?? "", email: userEmail ?? "" }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {list.length < MAX_ADDRESSES ? (
            <Button variant="outline" size="lg" className="w-full" icon={<Plus className="h-4 w-4" aria-hidden />} onClick={() => setAdding(true)}>
              Add new address
            </Button>
          ) : (
            <p className="text-xs text-ink/60">You have reached the limit of {MAX_ADDRESSES} saved addresses.</p>
          )}
          <Button size="lg" className="w-full" disabled={!selectedId} onClick={onContinue}>
            Deliver here
          </Button>
        </div>
      )}
    </div>
  );
}
