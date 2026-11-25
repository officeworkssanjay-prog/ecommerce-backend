"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { api, errorMessage, qs } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { Role } from "@/lib/types";
import { useApi } from "@/lib/useApi";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useFeedback } from "@/components/ui/Feedback";
import { Select } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/States";
import { DataTable, PageHeader, StatusPill } from "@/components/admin/AdminKit";
import type { Column } from "@/components/admin/AdminKit";
import { UserFormModal } from "@/components/admin/users/UserFormModal";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { confirm, toast } = useFeedback();
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, loading, message, reload } = useApi(async () => (await api.get<AdminUser[]>(`/admin/users${qs({ role, status })}`)).data, [role, status]);

  const toggle = async (u: AdminUser) => {
    const next = !u.status;
    if (!next) {
      const ok = await confirm({
        title: "Deactivate this account?",
        message: `${u.name} (${u.email}) will no longer be able to sign in.`,
        confirmLabel: "Deactivate",
        danger: true,
      });
      if (!ok) return;
    }
    setBusyId(u.id);
    try {
      await api.put(`/admin/users/${u.id}/status`, { status: next });
      toast.success(`${u.name} ${next ? "activated" : "deactivated"}`);
      reload();
    } catch (err) {
      toast.error(errorMessage(err)); // e.g. own account / last admin refusals
    } finally {
      setBusyId(null);
    }
  };

  const columns: Column<AdminUser>[] = [
    { key: "name", header: "Name", render: (u) => <span className="font-medium">{u.name}</span> },
    { key: "email", header: "Email" },
    { key: "role", header: "Role", render: (u) => <Badge tone={u.role === "ADMIN" ? "gold" : "neutral"}>{u.role === "ADMIN" ? "Admin" : "Customer"}</Badge> },
    { key: "status", header: "Status", render: (u) => <StatusPill active={u.status} onLabel="Active" offLabel="Deactivated" /> },
    { key: "createdAt", header: "Joined", render: (u) => formatDate(u.createdAt) },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (u) => (
        <Button size="sm" variant={u.status ? "ghost" : "outline"} loading={busyId === u.id} onClick={() => toggle(u)} aria-label={`${u.status ? "Deactivate" : "Activate"} ${u.name}`}>
          {u.status ? "Deactivate" : "Activate"}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Customer and admin accounts."
        actions={
          <Button icon={<UserPlus className="h-4 w-4" aria-hidden />} onClick={() => setFormOpen(true)}>
            Add user
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <Select aria-label="Filter by role" value={role} onChange={(e) => setRole(e.target.value)} className="w-44">
          <option value="">All roles</option>
          <option value="USER">Customers</option>
          <option value="ADMIN">Admins</option>
        </Select>
        <Select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
          <option value="">Any status</option>
          <option value="true">Active</option>
          <option value="false">Deactivated</option>
        </Select>
      </div>
      <div aria-live="polite">
        {message && !data ? (
          <ErrorState message={message} onRetry={reload} />
        ) : (
          <DataTable columns={columns} rows={data} loading={loading && !data} emptyTitle="No users match these filters" />
        )}
      </div>
      <UserFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={reload} />
    </div>
  );
}
