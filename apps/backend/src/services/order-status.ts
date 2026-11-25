import { OrderStatus, PaymentStatus, prisma } from "@ecommerce/database";
import { AppError } from "../utils/errors";
import { restockOrder } from "./checkout.service";

/** Orders move forward through fulfilment; the only way out of the flow early is CANCELED. */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PROCESSED_AND_READY_TO_SHIP", "CANCELED"],
  PROCESSED_AND_READY_TO_SHIP: ["DROPPED_OFF", "SHIPPED", "CANCELED"],
  DROPPED_OFF: ["SHIPPED", "CANCELED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELED: [],
};

const label = (s: string) => s.toLowerCase().replace(/_/g, " ");

export async function changeOrderStatus(
  orderId: string,
  input: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus }
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) throw AppError.notFound("Order not found");

    const data: { orderStatus?: OrderStatus; paymentStatus?: PaymentStatus } = {};

    if (input.orderStatus && input.orderStatus !== order.orderStatus) {
      if (!ORDER_TRANSITIONS[order.orderStatus].includes(input.orderStatus)) {
        throw AppError.conflict(`An order that is ${label(order.orderStatus)} cannot be moved to ${label(input.orderStatus)}`);
      }
      data.orderStatus = input.orderStatus;
      // Cash is collected on delivery
      if (input.orderStatus === "DELIVERED" && order.paymentMethod === "COD" && order.paymentStatus === "UNPAID") {
        data.paymentStatus = "PAID";
      }
    }

    if (input.paymentStatus && input.paymentStatus !== order.paymentStatus && data.paymentStatus === undefined) {
      if (order.paymentMethod !== "COD" || input.paymentStatus !== "PAID") {
        throw AppError.conflict("Only cash-on-delivery orders can be marked as paid by hand; online payments are confirmed automatically");
      }
      if (order.orderStatus === "CANCELED" || data.orderStatus === "CANCELED") {
        throw AppError.conflict("A cancelled order cannot be marked as paid");
      }
      data.paymentStatus = "PAID";
    }

    if (Object.keys(data).length === 0) return order;

    // Guarded write: fails if someone else changed the status meanwhile
    const res = await tx.order.updateMany({ where: { id: orderId, orderStatus: order.orderStatus }, data });
    if (res.count !== 1) throw AppError.conflict("This order was just updated by someone else. Reload and try again.");

    if (data.orderStatus === "CANCELED") await restockOrder(tx, orderId);

    return tx.order.findUniqueOrThrow({ where: { id: orderId } });
  });
}
