"use client";

import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { formatDate } from "@/lib/format";
import type { AdminBlogComment } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { useFeedback } from "@/components/ui/Feedback";
import { DataTable, PageHeader, StatusPill } from "@/components/admin/AdminKit";
import { RowActions, deleteWithConfirm, patchRecord } from "@/components/admin/content/helpers";

export default function CommentsPage() {
  const fb = useFeedback();
  const { data, loading, error, message, reload } = useApi(async () => (await api.get<AdminBlogComment[]>("/admin/blog-comments")).data);

  const columns = [
    {
      key: "comment",
      header: "Comment",
      className: "max-w-sm",
      render: (c: AdminBlogComment) => (
        <>
          <p className="line-clamp-3 whitespace-pre-line">{c.comment}</p>
          <p className="mt-1 text-xs text-ink/60">on {c.blog?.title ?? "a deleted post"}</p>
        </>
      ),
    },
    { key: "user", header: "Author", render: (c: AdminBlogComment) => (<><div>{c.user?.name}</div><div className="text-xs text-ink/60">{c.user?.email}</div></>) },
    { key: "date", header: "Date", render: (c: AdminBlogComment) => formatDate(c.createdAt) },
    { key: "status", header: "Status", render: (c: AdminBlogComment) => <StatusPill active={c.status} onLabel="Visible" offLabel="Hidden" /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (c: AdminBlogComment) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="outline" size="sm" onClick={() => patchRecord(fb, `/admin/blog-comments/${c.id}/status`, { status: !c.status }, c.status ? "Comment hidden" : "Comment approved", reload)}>
            {c.status ? "Hide" : "Approve"}
          </Button>
          <RowActions
            name="comment"
            onDelete={() => deleteWithConfirm(fb, { path: `/admin/blog-comments/${c.id}`, title: "Delete comment?", message: "This comment will be removed permanently.", success: "Comment deleted", onDone: reload })}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Blog comments" description="Approve, hide or delete comments left on blog posts." />
      {error ? <ErrorState message={message} onRetry={reload} /> : <DataTable columns={columns} rows={data} loading={loading} emptyTitle="No comments yet" />}
    </div>
  );
}
