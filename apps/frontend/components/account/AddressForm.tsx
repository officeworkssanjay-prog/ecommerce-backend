"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { AddressInputSchema } from "@ecommerce/shared-types";
import type { Address } from "@/lib/types";
import { applyServerErrors } from "@/lib/forms";
import { Button } from "@/components/ui/Button";
import { Checkbox, FormError, Input, Select } from "@/components/ui/Field";
import { PincodeNote } from "@/components/pincode/PincodeNote";
import { usePincode } from "@/components/pincode/usePincode";

type FormIn = z.input<typeof AddressInputSchema>;
type FormOut = z.output<typeof AddressInputSchema>;

interface Props {
  initial?: Address | null;
  /** Performs the API call. Throw (ApiError) to show server errors on the form. */
  onSave: (values: FormOut) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  /** Show the "make default" checkbox. */
  allowDefault?: boolean;
  defaults?: Partial<FormIn>;
  /** Check delivery for the postal code as it is typed. */
  checkPincode?: boolean;
}

export function AddressForm({ initial, onSave, onCancel, submitLabel = "Save address", allowDefault = true, defaults, checkPincode }: Props) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(AddressInputSchema),
    defaultValues: initial
      ? {
          name: initial.name,
          email: initial.email,
          phone: initial.phone,
          country: initial.country,
          state: initial.state,
          city: initial.city,
          zipCode: initial.zipCode,
          address: initial.address,
          addressType: initial.addressType === "office" ? "office" : "home",
          isDefault: initial.isDefault,
        }
      : { country: "", addressType: "home", isDefault: false, ...defaults },
  });

  const zip = useWatch({ control, name: "zipCode" });
  const pincode = usePincode(checkPincode ? zip : undefined);

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await onSave(values);
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-4" aria-label="Address form">
      <FormError message={formError} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Full name" autoComplete="name" required error={errors.name?.message} {...register("name")} />
        <Input label="Email" type="email" autoComplete="email" required error={errors.email?.message} {...register("email")} />
        <Input label="Phone" type="tel" autoComplete="tel" required error={errors.phone?.message} {...register("phone")} />
        <Select label="Address type" error={errors.addressType?.message} {...register("addressType")}>
          <option value="home">Home</option>
          <option value="office">Office</option>
        </Select>
        <Input label="Street address" autoComplete="street-address" required className="sm:col-span-2" error={errors.address?.message} {...register("address")} />
        <Input label="City" autoComplete="address-level2" required error={errors.city?.message} {...register("city")} />
        <Input label="State" autoComplete="address-level1" required error={errors.state?.message} {...register("state")} />
        <Input label="Postal code" autoComplete="postal-code" required error={errors.zipCode?.message} {...register("zipCode")} />
        <Input label="Country" autoComplete="country-name" required error={errors.country?.message} {...register("country")} />
        {checkPincode && (
          <div className="sm:col-span-2" aria-live="polite">
            <PincodeNote state={pincode} />
          </div>
        )}
      </div>
      {allowDefault && <Checkbox label="Make this my default address" {...register("isDefault")} />}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
