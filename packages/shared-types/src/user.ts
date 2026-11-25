import { z } from "zod";
import { AddressInputSchema } from "./order";
import { emptyToUndefined } from "./common";

export const UpdateAddressSchema = AddressInputSchema.partial();
export type UpdateAddressInput = z.infer<typeof UpdateAddressSchema>;

export const CreateReviewSchema = z.object({
  productId: z.string({ required_error: "Product is required" }).uuid("Invalid product"),
  rating: z.coerce
    .number({ invalid_type_error: "Rating must be a number" })
    .int("Rating must be a whole number")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5"),
  review: z.string({ required_error: "Review text is required" }).trim().min(10, "Review must be at least 10 characters").max(1000, "Review must be at most 1000 characters"),
});
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

export const BlogCommentSchema = z.object({
  comment: z.string({ required_error: "Comment is required" }).trim().min(2, "Comment is too short").max(1000, "Comment must be at most 1000 characters"),
});

export const NewsletterSchema = z.object({
  email: z.string({ required_error: "Email is required" }).trim().toLowerCase().email("Enter a valid email address").max(254),
});

export const ContactSchema = z.object({
  name: z.string({ required_error: "Name is required" }).trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string({ required_error: "Email is required" }).trim().toLowerCase().email("Enter a valid email address").max(254),
  subject: z.string().trim().max(150, "Subject must be at most 150 characters").optional(),
  message: z.string({ required_error: "Message is required" }).trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be at most 2000 characters"),
});
export type ContactInput = z.infer<typeof ContactSchema>;

export const ChatSendSchema = z.object({
  receiverId: z.string({ required_error: "Recipient is required" }).uuid("Invalid recipient"),
  message: z.string({ required_error: "Message is required" }).trim().min(1, "Message cannot be empty").max(2000, "Message must be at most 2000 characters"),
});
export const ChatReceiverParamSchema = z.object({ receiverId: z.string().uuid("Invalid recipient") });

export const BlogListQuerySchema = z.object({
  category: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(10000).default(1)),
  limit: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(50).default(10)),
});
