import { z } from "zod";

export const RoleEnum = z.enum(["ADMIN", "VENDOR", "USER"]);
export type RoleType = z.infer<typeof RoleEnum>;

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  passwordConfirmation: z.string().min(6),
}).refine((data) => data.password === data.passwordConfirmation, {
  message: "Passwords do not match",
  path: ["passwordConfirmation"],
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export interface AuthUserSession {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  avatar?: string | null;
  vendorId?: string | null;
}
