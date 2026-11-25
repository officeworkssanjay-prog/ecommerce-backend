"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useApi } from "@/lib/useApi";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Blog, BlogCategory } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { useFeedback } from "@/components/ui/Feedback";
import { DataTable, PageHeader, StatusPill } from "@/components/admin/AdminKit";
import { BlogCategoryForm, BlogForm } from "@/components/admin/content/BlogForms";
import { RowActions, deleteWithConfirm, patchRecord } from "@/components/admin/content/helpers";

type Tab = "posts" | "categories";

export default function BlogsPage() {
  const fb = useFeedback();
  const [tab, setTab] = useState<Tab>("posts");
  const posts = useApi(async () => (await api.get<Blog[]>("/admin/blogs")).data);
  const cats = useApi(async () => (await api.get<BlogCategory[]>("/admin/blog-categories")).data);
  const [editPost, setEditPost] = useState<Blog | null | "new">(null);
  const [editCat, setEditCat] = useState<BlogCategory | null | "new">(null);

  const postColumns = [
    {
      key: "title",
      header: "Post",
      render: (b: Blog) => (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.image} alt="" className="h-10 w-14 rounded object-cover" />
          <span className="font-medium">{b.title}</span>
        </div>
      ),
    },
    { key: "category", header: "Category", render: (b: Blog) => b.category?.name ?? "" },
    { key: "comments", header: "Comments", render: (b: Blog) => b._count?.comments ?? 0 },
    { key: "date", header: "Created", render: (b: Blog) => formatDate(b.createdAt) },
    {
      key: "status",
      header: "Status",
      render: (b: Blog) => (
        <button type="button" aria-label={`${b.status ? "Unpublish" : "Publish"} ${b.title}`} onClick={() => patchRecord(fb, `/admin/blogs/${b.id}`, { status: !b.status }, b.status ? "Post unpublished" : "Post published", posts.reload)}>
          <StatusPill active={b.status} onLabel="Published" offLabel="Draft" />
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (b: Blog) => (
        <RowActions
          name={b.title}
          onEdit={() => setEditPost(b)}
          onDelete={() => deleteWithConfirm(fb, { path: `/admin/blogs/${b.id}`, title: "Delete post?", message: `"${b.title}" and its comments will be removed permanently.`, success: "Post deleted", onDone: posts.reload })}
        />
      ),
    },
  ];

  const catColumns = [
    { key: "name", header: "Name", render: (c: BlogCategory) => <span className="font-medium">{c.name}</span> },
    { key: "posts", header: "Posts", render: (c: BlogCategory) => c._count?.blogs ?? 0 },
    {
      key: "status",
      header: "Status",
      render: (c: BlogCategory) => (
        <button type="button" aria-label={`${c.status ? "Disable" : "Enable"} ${c.name}`} onClick={() => patchRecord(fb, `/admin/blog-categories/${c.id}`, { status: !c.status }, c.status ? "Category disabled" : "Category enabled", cats.reload)}>
          <StatusPill active={c.status} />
        </button>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (c: BlogCategory) => (
        <RowActions
          name={c.name}
          onEdit={() => setEditCat(c)}
          onDelete={() => deleteWithConfirm(fb, { path: `/admin/blog-categories/${c.id}`, title: "Delete category?", message: `"${c.name}" will be removed permanently.`, success: "Category deleted", onDone: cats.reload })}
        />
      ),
    },
  ];

  const tabClass = (t: Tab) => cn("border-b-2 px-4 py-2 text-sm font-medium", tab === t ? "border-gold text-ink" : "border-transparent text-ink/60 hover:text-ink");

  return (
    <div>
      <PageHeader
        title="Blog"
        description="Write posts and organise them into categories."
        actions={
          tab === "posts" ? (
            <Button icon={<Plus className="h-4 w-4" aria-hidden />} onClick={() => setEditPost("new")} disabled={!cats.data?.length}>
              New post
            </Button>
          ) : (
            <Button icon={<Plus className="h-4 w-4" aria-hidden />} onClick={() => setEditCat("new")}>
              New category
            </Button>
          )
        }
      />
      <div role="tablist" aria-label="Blog sections" className="mb-4 flex border-b border-sand">
        <button role="tab" id="tab-posts" aria-selected={tab === "posts"} aria-controls="panel-blog" className={tabClass("posts")} onClick={() => setTab("posts")}>
          Posts
        </button>
        <button role="tab" id="tab-categories" aria-selected={tab === "categories"} aria-controls="panel-blog" className={tabClass("categories")} onClick={() => setTab("categories")}>
          Blog categories
        </button>
      </div>
      <div role="tabpanel" id="panel-blog" aria-labelledby={`tab-${tab}`}>
        {tab === "posts" ? (
          <>
            {!cats.loading && !cats.data?.length && <p className="mb-3 text-sm text-ink/60">Create a blog category first, then you can add posts.</p>}
            {posts.error ? <ErrorState message={posts.message} onRetry={posts.reload} /> : <DataTable columns={postColumns} rows={posts.data} loading={posts.loading} emptyTitle="No posts yet" />}
          </>
        ) : cats.error ? (
          <ErrorState message={cats.message} onRetry={cats.reload} />
        ) : (
          <DataTable columns={catColumns} rows={cats.data} loading={cats.loading} emptyTitle="No blog categories yet" />
        )}
      </div>
      {editPost && (
        <BlogForm
          blog={editPost === "new" ? null : editPost}
          categories={cats.data ?? []}
          onClose={() => setEditPost(null)}
          onSaved={() => {
            setEditPost(null);
            posts.reload();
          }}
        />
      )}
      {editCat && (
        <BlogCategoryForm
          category={editCat === "new" ? null : editCat}
          onClose={() => setEditCat(null)}
          onSaved={() => {
            setEditCat(null);
            cats.reload();
            posts.reload();
          }}
        />
      )}
    </div>
  );
}
