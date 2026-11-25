"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { ContactSchema } from "@ecommerce/shared-types";
import type { z } from "zod";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import { Button } from "@/components/ui/Button";
import { FormError, Input, Select, Textarea } from "@/components/ui/Field";
import { useFeedback } from "@/components/ui/Feedback";

type ContactInput = z.input<typeof ContactSchema>;

const SUBJECTS = [
  "Bespoke Bridal Jewellery Consultation",
  "Solitaire Diamond Engagement Ring Customization",
  "Antique 22K Gold Temple Heirloom Commission",
  "Private Video Showcase Booking",
  "Order Verification & Delivery Status",
];

export function ContactForm() {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(ContactSchema), defaultValues: { name: "", email: "", subject: SUBJECTS[0], message: "" } });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSuccess(null);
    try {
      const res = await api.post("/storefront/contact", values);
      const message = res.message || "Thank you! Your message has been received.";
      setSuccess(message);
      toast.success(message);
      reset();
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Your full name" required autoComplete="name" error={errors.name?.message} {...register("name")} />
        <Input label="Email address" type="email" required autoComplete="email" placeholder="name@example.com" error={errors.email?.message} {...register("email")} />
      </div>
      <Select label="Subject" error={errors.subject?.message} {...register("subject")}>
        {SUBJECTS.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </Select>
      <Textarea label="Message" required rows={5} placeholder="Tell us about your requirements: metal purity, stones, occasion or date…" error={errors.message?.message} {...register("message")} />
      <FormError message={formError} />
      <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send Inquiry"}
      </Button>
      <div aria-live="polite">
        {success && (
          <div className="flex items-start gap-2 rounded-2xl border border-success/30 bg-success/10 p-4 text-xs text-success">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{success}</span>
          </div>
        )}
      </div>
    </form>
  );
}
