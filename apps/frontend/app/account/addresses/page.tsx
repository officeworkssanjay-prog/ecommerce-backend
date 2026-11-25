"use client";

import { useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { api, errorMessage } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import type { Address } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState, PageLoader } from "@/components/ui/States";
import { Modal } from "@/components/ui/Modal";
import { useFeedback } from "@/components/ui/Feedback";
import { AccountHeader, AccountPage } from "@/components/account/AccountHeader";
import { AddressForm } from "@/components/account/AddressForm";
import { useAuth } from "@/context/AuthContext";

const MAX_ADDRESSES = 10;

export default function UserAddressesPage() {
  const { user } = useAuth();
  const { confirm, toast } = useFeedback();
  const addresses = useApi(async () => (await api.get<Address[]>("/user/addresses")).data, []);
  // undefined = closed, null = creating, Address = editing
  const [editing, setEditing] = useState<Address | null | undefined>(undefined);
  const [busyId, setBusyId] = useState<string | null>(null);

  const list = addresses.data ?? [];
  const atLimit = list.length >= MAX_ADDRESSES;

  const run = async (id: string, action: () => Promise<unknown>, success: string) => {
    setBusyId(id);
    try {
      await action();
      toast.success(success);
      addresses.reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (a: Address) => {
    if (await confirm({ title: "Delete this address?", message: `${a.address}, ${a.city}`, confirmLabel: "Delete", danger: true })) {
      await run(a.id, () => api.delete(`/user/addresses/${a.id}`), "Address deleted");
    }
  };

  const save = async (values: Parameters<React.ComponentProps<typeof AddressForm>["onSave"]>[0]) => {
    if (editing) await api.put(`/user/addresses/${editing.id}`, values);
    else await api.post("/user/addresses", values);
    toast.success(editing ? "Address updated" : "Address added");
    setEditing(undefined);
    addresses.reload();
  };

  return (
    <AccountPage>
      <AccountHeader
        title="My addresses"
        description={`Saved delivery addresses (${list.length} of ${MAX_ADDRESSES}).`}
        action={
          <Button icon={<Plus className="h-4 w-4" aria-hidden />} disabled={atLimit || !addresses.data} onClick={() => setEditing(null)}>
            Add address
          </Button>
        }
      />
      {atLimit && <p role="status" className="text-xs text-ink/60">You have reached the limit of {MAX_ADDRESSES} addresses. Delete one to add another.</p>}

      {addresses.loading && !addresses.data ? (
        <PageLoader label="Loading your addresses…" />
      ) : addresses.error || !addresses.data ? (
        <ErrorState message={addresses.message} onRetry={addresses.reload} />
      ) : list.length === 0 ? (
        <EmptyState icon={<MapPin className="h-10 w-10" aria-hidden />} title="No saved addresses" description="Add an address to speed up checkout." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {list.map((a) => (
            <li key={a.id} className="space-y-3 rounded-2xl border border-sand bg-white p-5 text-sm">
              <div className="flex items-center gap-2">
                <p className="font-serif text-lg text-ink">{a.name}</p>
                <Badge tone="neutral">{a.addressType === "office" ? "Office" : "Home"}</Badge>
                {a.isDefault && <Badge tone="gold">Default</Badge>}
              </div>
              <p className="text-ink/70">
                {a.address}, {a.city}, {a.state} {a.zipCode}, {a.country}
              </p>
              <p className="text-xs text-ink/60">
                {a.phone} · {a.email}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" icon={<Pencil className="h-3.5 w-3.5" aria-hidden />} onClick={() => setEditing(a)} aria-label={`Edit address for ${a.name}`}>
                  Edit
                </Button>
                {!a.isDefault && (
                  <Button size="sm" variant="ghost" loading={busyId === a.id} onClick={() => run(a.id, () => api.put(`/user/addresses/${a.id}/default`), "Default address updated")}>
                    Set as default
                  </Button>
                )}
                <Button size="sm" variant="ghost" disabled={busyId === a.id} icon={<Trash2 className="h-3.5 w-3.5" aria-hidden />} onClick={() => remove(a)} aria-label={`Delete address for ${a.name}`}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={editing !== undefined} onClose={() => setEditing(undefined)} title={editing ? "Edit address" : "Add address"} size="lg">
        {editing !== undefined && (
          <AddressForm
            key={editing?.id ?? "new"}
            initial={editing}
            onSave={save}
            onCancel={() => setEditing(undefined)}
            defaults={{ name: user?.name ?? "", email: user?.email ?? "" }}
            allowDefault={!editing?.isDefault}
          />
        )}
      </Modal>
    </AccountPage>
  );
}
