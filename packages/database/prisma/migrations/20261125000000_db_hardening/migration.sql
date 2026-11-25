-- DropIndex
DROP INDEX "Order_invoiceId_idx";

-- DropIndex
DROP INDEX "Order_userId_idx";

-- AlterTable
ALTER TABLE "Coupon" ALTER COLUMN "discount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "gatewayOrderId" TEXT,
ALTER COLUMN "subTotal" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "OrderProduct" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "variantTotal" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "offerPrice" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "ProductVariantItem" ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "ShippingRule" ALTER COLUMN "minCost" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "cost" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Slider" ALTER COLUMN "startingPrice" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "amountRealCurrency" SET DATA TYPE DECIMAL(12,2);

-- CreateIndex
CREATE INDEX "Blog_categoryId_idx" ON "Blog"("categoryId");

-- CreateIndex
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "Order_gatewayOrderId_idx" ON "Order"("gatewayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductReview_userId_productId_key" ON "ProductReview"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingRule_name_key" ON "ShippingRule"("name");

-- ==========================================
-- Data integrity rules enforced by the database
-- ==========================================
ALTER TABLE "Product" ADD CONSTRAINT "Product_qty_nonneg" CHECK ("qty" >= 0);
ALTER TABLE "Product" ADD CONSTRAINT "Product_price_nonneg" CHECK ("price" >= 0);
ALTER TABLE "Product" ADD CONSTRAINT "Product_offerPrice_valid" CHECK ("offerPrice" IS NULL OR ("offerPrice" >= 0 AND "offerPrice" <= "price"));
ALTER TABLE "ProductVariantItem" ADD CONSTRAINT "ProductVariantItem_price_nonneg" CHECK ("price" >= 0);

ALTER TABLE "Order" ADD CONSTRAINT "Order_amounts_nonneg" CHECK ("subTotal" >= 0 AND "amount" >= 0);
ALTER TABLE "Order" ADD CONSTRAINT "Order_productQty_positive" CHECK ("productQty" > 0);
ALTER TABLE "OrderProduct" ADD CONSTRAINT "OrderProduct_qty_positive" CHECK ("qty" > 0);
ALTER TABLE "OrderProduct" ADD CONSTRAINT "OrderProduct_prices_nonneg" CHECK ("unitPrice" >= 0 AND "variantTotal" >= 0);
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_amount_nonneg" CHECK ("amount" >= 0 AND "amountRealCurrency" >= 0);

ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_counters_valid" CHECK ("quantity" >= 0 AND "maxUse" >= 1 AND "totalUsed" >= 0);
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_discount_valid" CHECK ("discount" > 0 AND ("discountType" <> 'PERCENT' OR "discount" <= 100));
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_dates_valid" CHECK ("endDate" >= "startDate");

ALTER TABLE "ShippingRule" ADD CONSTRAINT "ShippingRule_cost_nonneg" CHECK ("cost" >= 0 AND ("minCost" IS NULL OR "minCost" >= 0));
ALTER TABLE "Slider" ADD CONSTRAINT "Slider_startingPrice_nonneg" CHECK ("startingPrice" IS NULL OR "startingPrice" >= 0);

ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_rating_range" CHECK ("rating" BETWEEN 1 AND 5);
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_no_self_message" CHECK ("senderId" <> "receiverId");
ALTER TABLE "User" ADD CONSTRAINT "User_email_lowercase" CHECK ("email" = lower("email"));
