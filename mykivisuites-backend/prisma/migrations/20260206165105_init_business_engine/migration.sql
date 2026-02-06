/*
  Warnings:

  - A unique constraint covering the columns `[sku,tenantId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Made the column `sku` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unitId` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_unitId_fkey";

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "sku" SET NOT NULL,
ALTER COLUMN "unitId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_tenantId_key" ON "Product"("sku", "tenantId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
