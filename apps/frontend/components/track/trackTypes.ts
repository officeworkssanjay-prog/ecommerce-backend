import type { OrderStatus } from "@/lib/types";

export interface TrackedOrder {
  id: string;
  invoiceId: number;
  orderStatus: OrderStatus;
  paymentStatus: "UNPAID" | "PAID";
  createdAt: string;
  updatedAt: string;
  orderProducts: { productName: string; qty: number; unitPrice: number }[];
}

export const NOT_FOUND = "We couldn't find an order matching that invoice number and email. Please check both and try again.";
