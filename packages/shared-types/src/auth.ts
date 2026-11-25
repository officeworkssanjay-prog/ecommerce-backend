import { z } from "zod";

export const RoleEnum = z.enum(["ADMIN", "USER"]);
export type RoleType = z.infer<typeof RoleEnum>;

const emailField = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .email("Invalid email address")
  .max(254, "Email is too long");

/** bcrypt only uses the first 72 bytes, so longer passwords are rejected. */
const strongPassword = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const personName = z
  .string({ required_error: "Name is required" })
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(80, "Name must be at most 80 characters");

/** Phone numbers: digits with optional leading +, spaces, dashes (7-15 digits). */
export const PhoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9\s-]{5,18}[0-9]$/, "Enter a valid phone number");

// No password policy on login: existing accounts must always be able to sign in.
export const LoginSchema = z.object({
  email: emailField,
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .max(72, "Password must be at most 72 characters"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z
  .object({
    name: personName,
    email: emailField,
    password: strongPassword,
    passwordConfirmation: z.string().optional(),
  })
  .refine((data) => data.passwordConfirmation === undefined || data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string({ required_error: "Current password is required" }).min(1, "Current password is required"),
    newPassword: strongPassword,
    passwordConfirmation: z.string().optional(),
  })
  .refine((d) => d.passwordConfirmation === undefined || d.newPassword === d.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

/** Images: a site path (e.g. /uploads/x.png, /images/x.png) or an https URL; "" clears it. */
export const ImageUrlSchema = z
  .string()
  .trim()
  .max(500, "Image URL is too long")
  .refine(
    (v) => v === "" || (/^\/(?!\/)[\w\-./%]+$/.test(v) && !v.includes("..")) || /^https:\/\/\S+$/i.test(v),
    "Invalid image URL"
  );

export const UpdateProfileSchema = z.object({
  name: personName.optional(),
  phone: z.union([PhoneSchema, z.literal("")]).optional(), // "" clears the phone number
  avatar: ImageUrlSchema.optional(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export interface AuthUserSession {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  avatar?: string | null;
}
