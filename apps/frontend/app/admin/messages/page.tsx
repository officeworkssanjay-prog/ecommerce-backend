"use client";

import { useState } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { DataTable, PageHeader } from "@/components/admin/AdminKit";
import type { Column } from "@/components/admin/AdminKit";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { useFeedback } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";
import { ErrorState } from "@/components/ui/States";
import { api, errorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { useApi } from "@/lib/useApi";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const { toast, confirm } = useFeedback();
  const inbox = useApi(async () => {
    const res = await api.get<ContactMessage[]>("/admin/messages");
    return { messages: res.data, unread: res.unread ?? 0 };
  });
  const [open, setOpen] = useState<ContactMessage | null>(null);
  const [busy, setBusy] = useState(false);

  const setRead = async (m: ContactMessage, isRead: boolean) => {
    setBusy(true);
    try {
      await api.put(`/admin/messages/${m.id}`, { isRead });
      setOpen((cur) => (cur && cur.id === m.id ? { ...cur, isRead } : cur));
      inbox.reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const view = async (m: ContactMessage) => {
    setOpen(m);
    if (!m.isRead) await setRead(m, true);
  };

  const remove = async (m: ContactMessage) => {
    if (!(await confirm({ title: "Delete this message?", message: `From ${m.name}. This cannot be undone.`, confirmLabel: "Delete", danger: true }))) return;
    try {
      await api.delete(`/admin/messages/${m.id}`);
      toast.success("Message deleted");
      setOpen(null);
      inbox.reload();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const columns: Column<ContactMessage>[] = [
    { key: "createdAt", header: "Received", render: (m) => <span className={m.isRead ? "" : "font-semibold"}>{formatDateTime(m.createdAt)}</span> },
    {
      key: "from",
      header: "From",
      render: (m) => (
        <div>
          <div className={m.isRead ? "" : "font-semibold"}>{m.name}</div>
          <div className="text-xs text-ink/55">{m.email}</div>
        </div>
      ),
    },
    { key: "subject", header: "Subject", render: (m) => m.subject || <span className="text-ink/40">(no subject)</span> },
    { key: "isRead", header: "Status", render: (m) => (m.isRead ? <Badge>Read</Badge> : <Badge tone="gold">New</Badge>) },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (m) => (
        <Button size="sm" variant="outline" onClick={() => view(m)}>
          Open
        </Button>
      ),
    },
  ];

  if (inbox.error) return <ErrorState message={inbox.message} onRetry={inbox.reload} />;

  return (
    <>
      <PageHeader
        title="Messages"
        description={inbox.data ? `${inbox.data.unread} unread` : "Messages sent through the contact form"}
      />
      <DataTable
        columns={columns}
        rows={inbox.data?.messages}
        loading={inbox.loading && !inbox.data}
        emptyTitle="No messages yet"
        emptyDescription="Messages sent through the Contact page appear here."
      />

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={open?.subject || "Message"}
        footer={
          open && (
            <>
              <Button variant="ghost" icon={<Trash2 className="h-4 w-4" />} onClick={() => remove(open)}>
                Delete
              </Button>
              <Button variant="outline" loading={busy} icon={open.isRead ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />} onClick={() => setRead(open, !open.isRead)}>
                {open.isRead ? "Mark as unread" : "Mark as read"}
              </Button>
              <a className={buttonClasses("primary")} href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.subject || "Your enquiry"}`)}`}>
                Reply by email
              </a>
            </>
          )
        }
      >
        {open && (
          <div className="space-y-3 text-sm">
            <p className="text-ink/60">
              From <strong className="text-ink">{open.name}</strong> ({open.email}) on {formatDateTime(open.createdAt)}
            </p>
            <p className="whitespace-pre-wrap rounded-md bg-white p-3 text-ink">{open.message}</p>
          </div>
        )}
      </Modal>
    </>
  );
}
