import { Prisma, PrismaClient } from "@prisma/client";

// Money columns are DECIMAL(12,2). Serialise them as plain JSON numbers so API
// responses keep the shape clients already expect (2-decimal values are exact in a double).
(Prisma.Decimal.prototype as unknown as { toJSON: () => number }).toJSON = function (this: Prisma.Decimal) {
  return this.toNumber();
};

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export * from "@prisma/client";
export default prisma;
