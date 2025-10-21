/*
  Warnings:

  - You are about to drop the column `area_name` on the `campaign_area` table. All the data in the column will be lost.
  - Added the required column `areaName` to the `campaign_area` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."campaign_area_target_area_idx";

-- DropIndex
DROP INDEX "public"."driver_current_location_idx";

-- DropIndex
DROP INDEX "public"."driver_route_path_idx";

-- AlterTable
ALTER TABLE "campaign_area" DROP COLUMN "area_name",
ADD COLUMN     "areaName" VARCHAR(100) NOT NULL;
