"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CreateBlogCategorySchema, CreateBlogSchema } from "@ecommerce/shared-types";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import type { Blog, BlogCategory } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Checkbox, FormError, Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useFeedback } from "@/components/ui/Feedback";
import { ImageUpload } from "@/components/ImageUpload";

type PostIn = z.input<typeof CreateBlogSchema>;
type PostOut = z.output<typeof CreateBlogSchema>;

export function BlogForm({ blog, categories, onClose, onSaved }: { blog: Blog | null; categories: BlogCategory[]; onClose: () => void; onSaved: () => void }) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PostIn, unknown, PostOut>({
    resolver: zodResolver(CreateBlogSchema),
    defaultValues: blog
      ? { categoryId: blog.categoryId ?? "", title: blog.title, image: blog.image, description: blog.description, seoTitle: blog.seoTitle ?? "", seoDescription: blog.seoDescription ?? "", status: blog.status }
      : { categoryId: "", title: "", image: "", description: "", seoTitle: "", seoDescription: "", status: true },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (blog) await api.put(`/admin/blogs/${blog.id}`, values);
      else await api.post("/admin/blogs", values);
      toast.success(blog ? "Post updated" : "Post created");
      onSaved();
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={blog ? "Edit post" : "New post"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="blog-form" loading={isSubmitting}>
            {blog ? "Save changes" : "Create post"}
          </Button>
        </>
      }
    >
      <form id="blog-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormError message={formError} />
        </div>
        <Input label="Title" required error={errors.title?.message} {...register("title")} />
        <Select label="Category" required error={errors.categoryId?.message} {...register("categoryId")}>
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <div className="sm:col-span-2">
          <Controller control={control} name="image" render={({ field }) => <ImageUpload label="Cover image *" value={field.value} onChange={(u) => field.onChange(u ?? "")} error={errors.image?.message} />} />
        </div>
        <Textarea label="Content" rows={8} required className="sm:col-span-2" hint="Plain text, at least 20 characters" error={errors.description?.message} {...register("description")} />
        <Input label="SEO title" hint="Up to 70 characters" error={errors.seoTitle?.message} {...register("seoTitle")} />
        <Checkbox label="Published" className="self-end pb-2" {...register("status")} />
        <Textarea label="SEO description" rows={2} className="sm:col-span-2" hint="Up to 300 characters" error={errors.seoDescription?.message} {...register("seoDescription")} />
      </form>
    </Modal>
  );
}

type CatIn = z.input<typeof CreateBlogCategorySchema>;
type CatOut = z.output<typeof CreateBlogCategorySchema>;

export function BlogCategoryForm({ category, onClose, onSaved }: { category: BlogCategory | null; onClose: () => void; onSaved: () => void }) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CatIn, unknown, CatOut>({
    resolver: zodResolver(CreateBlogCategorySchema),
    defaultValues: { name: category?.name ?? "", status: category?.status ?? true },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (category) await api.put(`/admin/blog-categories/${category.id}`, values);
      else await api.post("/admin/blog-categories", values);
      toast.success(category ? "Category updated" : "Category created");
      onSaved();
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      title={category ? "Edit blog category" : "New blog category"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="blog-cat-form" loading={isSubmitting}>
            {category ? "Save changes" : "Create category"}
          </Button>
        </>
      }
    >
      <form id="blog-cat-form" onSubmit={submit} noValidate className="grid gap-4">
        <FormError message={formError} />
        <Input label="Name" required error={errors.name?.message} {...register("name")} />
        <Checkbox label="Active" {...register("status")} />
      </form>
    </Modal>
  );
}
