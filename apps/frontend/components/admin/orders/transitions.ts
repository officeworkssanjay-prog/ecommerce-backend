import type { OrderStatus } from "@/lib/types";

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSED_AND_READY_TO_SHIP",
  "DROPPED_OFF",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELED",
];

/**
 * Legal next statuses for an order. Mirror of ORDER_TRANSITIONS in
 * apps/backend/src/services/order-status.ts: keep both in sync (the server is the authority).
 */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PROCESSED_AND_READY_TO_SHIP", "CANCELED"],
  PROCESSED_AND_READY_TO_SHIP: ["DROPPED_OFF", "SHIPPED", "CANCELED"],
  DROPPED_OFF: ["SHIPPED", "CANCELED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELED: [],
};
