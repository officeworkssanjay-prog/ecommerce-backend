"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@ecommerce/shared-types";
import type { LoginInput } from "@ecommerce/shared-types";
import { useAuth } from "@/context/AuthContext";
import { applyServerErrors } from "@/lib/forms";
import { Button } from "@/components/ui/Button";
import { FormError, Input } from "@/components/ui/Field";
import { AuthShell, safeNext } from "./AuthShell";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema), defaultValues: { email: "", password: "" } });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const user = await login(values.email, values.password);
      router.push(user.role === "ADMIN" ? "/admin/dashboard" : next ?? "/account");
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  const suffix = next ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <AuthShell
      title="Client Portal Sign In"
      subtitle="Access your orders, wishlist and saved addresses."
      footer={
        <>
          New to Sawariya Jewels?{" "}
          <Link href={`/register${suffix}`} className="font-bold text-gold-dark hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <FormError message={formError} />
        <Input label="Email address" type="email" autoComplete="email" placeholder="name@example.com" required error={errors.email?.message} {...register("email")} />
        <div className="space-y-1">
          <Input label="Password" type="password" autoComplete="current-password" required error={errors.password?.message} {...register("password")} />
          <div className="text-right">
            <Link href="/contact" className="text-[11px] text-gold-dark hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
