-- AlterTable
ALTER TABLE "GeneralSetting" ADD COLUMN     "codFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "giftWrapFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "prepaidDiscountPercent" DECIMAL(5,2) NOT NULL DEFAULT 0;
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "codFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "giftWrap" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "giftWrapFee" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "prepaidDiscount" DECIMAL(12,2) NOT NULL DEFAULT 0;
-- CreateTable
CREATE TABLE "ServiceablePincode" (
    "id" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "deliveryDays" INTEGER NOT NULL DEFAULT 5,
    "codAvailable" BOOLEAN NOT NULL DEFAULT true,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ServiceablePincode_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "StockAlert" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockAlert_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "ServiceablePincode_pincode_key" ON "ServiceablePincode"("pincode");
-- CreateIndex
CREATE INDEX "StockAlert_productId_idx" ON "StockAlert"("productId");
-- CreateIndex
CREATE UNIQUE INDEX "StockAlert_productId_email_key" ON "StockAlert"("productId", "email");
-- AddForeignKey
ALTER TABLE "StockAlert" ADD CONSTRAINT "StockAlert_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Fee rules
ALTER TABLE "GeneralSetting" ADD CONSTRAINT "GeneralSetting_fees_check" CHECK ("prepaidDiscountPercent" >= 0 AND "prepaidDiscountPercent" <= 100 AND "codFee" >= 0 AND "giftWrapFee" >= 0);
ALTER TABLE "Order" ADD CONSTRAINT "Order_fees_check" CHECK ("prepaidDiscount" >= 0 AND "codFee" >= 0 AND "giftWrapFee" >= 0);
ALTER TABLE "ServiceablePincode" ADD CONSTRAINT "ServiceablePincode_days_check" CHECK ("deliveryDays" >= 0);
