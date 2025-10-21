-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('driver', 'advertiser');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('sedan', 'suv', 'van', 'truck', 'hatchback');

-- CreateEnum
CREATE TYPE "SizeCategory" AS ENUM ('small', 'medium', 'large');

-- CreateTable
CREATE TABLE "user" (
    "user_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "user_type" "UserType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "driver" (
    "driver_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(20),
    "date_of_birth" DATE,
    "drivers_license_number" VARCHAR(50),
    "city" VARCHAR(100),
    "region" VARCHAR(100),
    "current_location" GEOMETRY(Point, 4326),
    "average_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "total_campaigns_completed" INTEGER NOT NULL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_pkey" PRIMARY KEY ("driver_id")
);

-- CreateTable
CREATE TABLE "vehicle" (
    "vehicle_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "driver_id" UUID NOT NULL,
    "make" VARCHAR(50) NOT NULL,
    "model" VARCHAR(50) NOT NULL,
    "year" INTEGER NOT NULL,
    "color" VARCHAR(30),
    "registration_number" VARCHAR(20) NOT NULL,
    "vehicle_type" "VehicleType",
    "size_category" "SizeCategory",
    "photo_url" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicle_pkey" PRIMARY KEY ("vehicle_id")
);

-- CreateTable
CREATE TABLE "advertiser" (
    "advertiser_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "company_name" VARCHAR(200) NOT NULL,
    "contact_person" VARCHAR(100),
    "phone_number" VARCHAR(20),
    "business_address" TEXT,
    "city" VARCHAR(100),
    "industry" VARCHAR(100),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advertiser_pkey" PRIMARY KEY ("advertiser_id")
);

-- CreateTable
CREATE TABLE "notification" (
    "notification_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "driver_user_id_key" ON "driver"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "driver_drivers_license_number_key" ON "driver"("drivers_license_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_registration_number_key" ON "vehicle"("registration_number");

-- CreateIndex
CREATE UNIQUE INDEX "advertiser_user_id_key" ON "advertiser"("user_id");

-- CreateTable
CREATE TABLE "driver_route" (
    "route_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "driver_id" UUID NOT NULL,
    "route_path" GEOMETRY(LineString, 4326) NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "distance" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_route_pkey" PRIMARY KEY ("route_id")
);

-- CreateTable
CREATE TABLE "campaign_area" (
    "area_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "advertiser_id" UUID NOT NULL,
    "area_name" VARCHAR(100) NOT NULL,
    "target_area" GEOMETRY(Polygon, 4326) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_area_pkey" PRIMARY KEY ("area_id")
);

-- CreateIndex on PostGIS columns for performance
CREATE INDEX "driver_current_location_idx" ON "driver" USING GIST ("current_location");
CREATE INDEX "driver_route_path_idx" ON "driver_route" USING GIST ("route_path");
CREATE INDEX "campaign_area_target_area_idx" ON "campaign_area" USING GIST ("target_area");

-- AddForeignKey
ALTER TABLE "driver" ADD CONSTRAINT "driver_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver"("driver_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertiser" ADD CONSTRAINT "advertiser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_route" ADD CONSTRAINT "driver_route_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver"("driver_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_area" ADD CONSTRAINT "campaign_area_advertiser_id_fkey" FOREIGN KEY ("advertiser_id") REFERENCES "advertiser"("advertiser_id") ON DELETE CASCADE ON UPDATE CASCADE;
