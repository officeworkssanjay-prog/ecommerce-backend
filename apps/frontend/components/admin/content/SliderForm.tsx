"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CreateSliderSchema } from "@ecommerce/shared-types";
import { api } from "@/lib/api";
import { applyServerErrors } from "@/lib/forms";
import type { Slider } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Checkbox, FormError, Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useFeedback } from "@/components/ui/Feedback";
import { ImageUpload } from "@/components/ImageUpload";

type In = z.input<typeof CreateSliderSchema>;
type Out = z.output<typeof CreateSliderSchema>;

export function SliderForm({ slider, onClose, onSaved }: { slider: Slider | null; onClose: () => void; onSaved: () => void }) {
  const { toast } = useFeedback();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<In, unknown, Out>({
    resolver: zodResolver(CreateSliderSchema),
    defaultValues: slider
      ? {
          banner: slider.banner,
          type: slider.type ?? "",
          title: slider.title ?? "",
          subtitle: slider.subtitle ?? "",
          startingPrice: slider.startingPrice != null ? Number(slider.startingPrice) : "",
          btnUrl: slider.btnUrl ?? "",
          serial: slider.serial,
          status: slider.status,
        }
      : { banner: "", type: "", title: "", subtitle: "", startingPrice: "", btnUrl: "", serial: 1, status: true },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      if (slider) await api.put(`/admin/sliders/${slider.id}`, values);
      else await api.post("/admin/sliders", values);
      toast.success(slider ? "Slider updated" : "Slider created");
      onSaved();
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={slider ? "Edit slider" : "New slider"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="slider-form" loading={isSubmitting}>
            {slider ? "Save changes" : "Create slider"}
          </Button>
        </>
      }
    >
      <form id="slider-form" onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormError message={formError} />
        </div>
        <div className="sm:col-span-2">
          <Controller
            control={control}
            name="banner"
            render={({ field }) => <ImageUpload label="Banner image *" value={field.value} onChange={(u) => field.onChange(u ?? "")} error={errors.banner?.message} />}
          />
        </div>
        <Input label="Type" hint="Small label above the title" error={errors.type?.message} {...register("type")} />
        <Input label="Title" error={errors.title?.message} {...register("title")} />
        <Input label="Subtitle" hint="One line under the title" className="sm:col-span-2" error={errors.subtitle?.message} {...register("subtitle")} />
        <Input label="Starting price" type="number" step="0.01" min="0" error={errors.startingPrice?.message} {...register("startingPrice")} />
        <Input label="Button link" placeholder="/products or https://..." error={errors.btnUrl?.message} {...register("btnUrl")} />
        <Input label="Display order" type="number" min="0" hint="Lower numbers show first" error={errors.serial?.message} {...register("serial")} />
        <Checkbox label="Active" className="self-end pb-2" {...register("status")} />
      </form>
    </Modal>
  );
}
