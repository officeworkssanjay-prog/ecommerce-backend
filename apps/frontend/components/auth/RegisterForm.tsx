"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema } from "@ecommerce/shared-types";
import type { RegisterInput } from "@ecommerce/shared-types";
import { useAuth } from "@/context/AuthContext";
import { applyServerErrors } from "@/lib/forms";
import { Button } from "@/components/ui/Button";
import { FormError, Input } from "@/components/ui/Field";
import { AuthShell, safeNext } from "./AuthShell";

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { register: registerUser } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: "", email: "", password: "", passwordConfirmation: "" },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const user = await registerUser({ name: values.name, email: values.email, password: values.password, passwordConfirmation: values.passwordConfirmation ?? "" });
      router.push(user.role === "ADMIN" ? "/admin/dashboard" : next ?? "/account");
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  const suffix = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Sawariya Jewels to track orders and save your favourites."
      footer={
        <>
          Already a member?{" "}
          <Link href={`/login${suffix}`} className="font-bold text-gold-dark hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormError message={formError} />
        <Input label="Full name" autoComplete="name" required error={errors.name?.message} {...register("name")} />
        <Input label="Email address" type="email" autoComplete="email" placeholder="name@example.com" required error={errors.email?.message} {...register("email")} />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          hint="At least 8 characters, with at least one letter and one number."
          error={errors.password?.message}
          {...register("password")}
        />
        <Input label="Confirm password" type="password" autoComplete="new-password" required error={errors.passwordConfirmation?.message} {...register("passwordConfirmation")} />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
