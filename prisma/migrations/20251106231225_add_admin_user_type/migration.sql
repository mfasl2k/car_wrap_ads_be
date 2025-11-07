/*
  Warnings:

  - You are about to drop the column `area_name` on the `campaign_target_area` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "UserType" ADD VALUE 'admin';

-- DropIndex
DROP INDEX "public"."idx_target_area_polygon";

-- DropIndex
DROP INDEX "public"."idx_location_point_geom";

-- DropIndex
DROP INDEX "public"."idx_location_track_route";

-- AlterTable
ALTER TABLE "campaign_target_area" DROP COLUMN "area_name",
ADD COLUMN     "areaName" VARCHAR(200);
