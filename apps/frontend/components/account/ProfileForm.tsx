"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateProfileSchema } from "@ecommerce/shared-types";
import type { UpdateProfileInput } from "@ecommerce/shared-types";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import type { AuthUser } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { FormError, Input } from "@/components/ui/Field";
import { useFeedback } from "@/components/ui/Feedback";
import { ImageUpload } from "@/components/ImageUpload";

export function ProfileForm({ profile }: { profile: AuthUser }) {
  const { setUser } = useAuth();
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: { name: profile.name, phone: profile.phone ?? "", avatar: profile.avatar ?? "" },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const res = await api.put<AuthUser>("/user/profile", values);
      setUser(res.data);
      reset({ name: res.data.name, phone: res.data.phone ?? "", avatar: res.data.avatar ?? "" });
      toast.success("Profile updated");
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-3xl border border-sand bg-white p-6" aria-label="Profile">
      <h2 className="font-serif text-xl text-ink">Profile</h2>
      <FormError message={formError} />
      <Controller
        control={control}
        name="avatar"
        render={({ field }) => <ImageUpload label="Profile photo" value={field.value} onChange={(url) => field.onChange(url ?? "")} error={errors.avatar?.message} />}
      />
      <Input label="Email" value={profile.email} readOnly disabled hint="Your email can't be changed here." />
      <Input label="Full name" autoComplete="name" error={errors.name?.message} {...register("name")} />
      <Input label="Phone" type="tel" autoComplete="tel" hint="Optional. Leave empty to remove it." error={errors.phone?.message} {...register("phone")} />
      <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
        Save changes
      </Button>
    </form>
  );
}
