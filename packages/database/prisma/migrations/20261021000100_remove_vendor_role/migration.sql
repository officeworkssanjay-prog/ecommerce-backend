-- Data migration: existing VENDOR accounts become plain USER accounts before the enum shrinks.
UPDATE "User" SET "role" = 'USER' WHERE "role"::text = 'VENDOR';

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'USER');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_userId_fkey";

-- DropForeignKey
ALTER TABLE "WithdrawRequest" DROP CONSTRAINT "WithdrawRequest_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "WithdrawRequest" DROP CONSTRAINT "WithdrawRequest_methodId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "OrderProduct" DROP CONSTRAINT "OrderProduct_vendorId_fkey";

-- DropIndex
DROP INDEX "Product_vendorId_idx";

-- DropIndex
DROP INDEX "Product_isApproved_idx";

-- DropIndex
DROP INDEX "OrderProduct_vendorId_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "isApproved",
DROP COLUMN "vendorId";

-- AlterTable
ALTER TABLE "OrderProduct" DROP COLUMN "vendorId";

-- AlterTable
ALTER TABLE "GeneralSetting" ALTER COLUMN "siteName" SET DEFAULT 'Marketplace';

-- DropTable
DROP TABLE "Vendor";

-- DropTable
DROP TABLE "VendorCondition";

-- DropTable
DROP TABLE "WithdrawMethod";

-- DropTable
DROP TABLE "WithdrawRequest";

-- DropEnum
DROP TYPE "WithdrawStatus";

