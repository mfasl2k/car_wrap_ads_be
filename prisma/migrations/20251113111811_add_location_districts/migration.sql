/*
  Warnings:

  - You are about to drop the column `areaName` on the `campaign_target_area` table. All the data in the column will be lost.
  - You are about to drop the column `polygon` on the `campaign_target_area` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[campaign_id,district_id]` on the table `campaign_target_area` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `district_id` to the `campaign_target_area` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "campaign_target_area" DROP COLUMN "areaName",
DROP COLUMN "polygon",
ADD COLUMN     "district_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "location_district" (
    "district_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "district_name" VARCHAR(200) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "region" VARCHAR(100),
    "polygon" GEOMETRY(Polygon, 4326) NOT NULL,
    "population" INTEGER,
    "area_km2" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_district_pkey" PRIMARY KEY ("district_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_target_area_campaign_id_district_id_key" ON "campaign_target_area"("campaign_id", "district_id");

-- AddForeignKey
ALTER TABLE "campaign_target_area" ADD CONSTRAINT "campaign_target_area_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "location_district"("district_id") ON DELETE RESTRICT ON UPDATE CASCADE;
