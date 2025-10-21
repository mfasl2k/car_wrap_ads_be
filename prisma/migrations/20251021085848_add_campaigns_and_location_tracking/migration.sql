-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "DriverCampaignStatus" AS ENUM ('pending', 'approved', 'active', 'completed', 'rejected');

-- CreateTable
CREATE TABLE "campaign" (
    "campaign_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "advertiser_id" UUID NOT NULL,
    "campaign_name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'draft',
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "payment_per_day" DECIMAL(10,2),
    "required_drivers" INTEGER NOT NULL DEFAULT 1,
    "wrap_design_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_pkey" PRIMARY KEY ("campaign_id")
);

-- CreateTable
CREATE TABLE "campaign_target_area" (
    "target_area_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "campaign_id" UUID NOT NULL,
    "area_name" VARCHAR(200),
    "polygon" GEOMETRY(Polygon, 4326) NOT NULL,
    "priority_level" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_target_area_pkey" PRIMARY KEY ("target_area_id")
);

-- CreateTable
CREATE TABLE "driver_campaign" (
    "driver_campaign_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "driver_id" UUID NOT NULL,
    "campaign_id" UUID NOT NULL,
    "status" "DriverCampaignStatus" NOT NULL DEFAULT 'pending',
    "match_score" DECIMAL(5,2),
    "start_date" DATE,
    "end_date" DATE,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "driver_campaign_pkey" PRIMARY KEY ("driver_campaign_id")
);

-- CreateTable
CREATE TABLE "location_track" (
    "track_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "driver_id" UUID NOT NULL,
    "driver_campaign_id" UUID,
    "track_date" DATE NOT NULL,
    "start_time" TIME(6),
    "end_time" TIME(6),
    "route_line" GEOMETRY(LineString, 4326),
    "distance_km" DECIMAL(10,2),
    "duration_hours" DECIMAL(5,2),
    "estimated_impressions" INTEGER NOT NULL DEFAULT 0,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_track_pkey" PRIMARY KEY ("track_id")
);

-- CreateTable
CREATE TABLE "location_point" (
    "point_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "track_id" UUID NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "location" GEOMETRY(Point, 4326) NOT NULL,
    "accuracy_meters" DECIMAL(6,2),
    "speed_kmh" DECIMAL(6,2),
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "location_point_pkey" PRIMARY KEY ("point_id")
);

-- CreateTable
CREATE TABLE "campaign_analytics" (
    "analytics_id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "campaign_id" UUID NOT NULL,
    "analytics_date" DATE NOT NULL,
    "active_drivers_count" INTEGER NOT NULL DEFAULT 0,
    "total_distance_km" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_impressions" INTEGER NOT NULL DEFAULT 0,
    "coverage_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "coverage_area" GEOMETRY(Polygon, 4326),
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_analytics_pkey" PRIMARY KEY ("analytics_id")
);

-- CreateIndex
CREATE INDEX "idx_campaign_advertiser" ON "campaign"("advertiser_id");

-- CreateIndex
CREATE INDEX "idx_campaign_status" ON "campaign"("status");

-- CreateIndex
CREATE INDEX "idx_driver_campaign_driver" ON "driver_campaign"("driver_id");

-- CreateIndex
CREATE INDEX "idx_driver_campaign_campaign" ON "driver_campaign"("campaign_id");

-- CreateIndex
CREATE INDEX "idx_driver_campaign_status" ON "driver_campaign"("status");

-- CreateIndex
CREATE UNIQUE INDEX "driver_campaign_driver_id_campaign_id_key" ON "driver_campaign"("driver_id", "campaign_id");

-- CreateIndex
CREATE INDEX "idx_location_track_driver" ON "location_track"("driver_id");

-- CreateIndex
CREATE INDEX "idx_location_track_date" ON "location_track"("track_date");

-- CreateIndex
CREATE INDEX "idx_location_track_unsynced" ON "location_track"("driver_id", "is_synced");

-- CreateIndex
CREATE INDEX "idx_location_point_recorded" ON "location_point"("track_id", "recorded_at");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_analytics_campaign_id_analytics_date_key" ON "campaign_analytics"("campaign_id", "analytics_date");

-- Create spatial indexes for PostGIS columns
CREATE INDEX "idx_target_area_polygon" ON "campaign_target_area" USING GIST ("polygon");
CREATE INDEX "idx_location_track_route" ON "location_track" USING GIST ("route_line");
CREATE INDEX "idx_location_point_geom" ON "location_point" USING GIST ("location");

-- AddForeignKey
ALTER TABLE "campaign" ADD CONSTRAINT "campaign_advertiser_id_fkey" FOREIGN KEY ("advertiser_id") REFERENCES "advertiser"("advertiser_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_target_area" ADD CONSTRAINT "campaign_target_area_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("campaign_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_campaign" ADD CONSTRAINT "driver_campaign_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver"("driver_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_campaign" ADD CONSTRAINT "driver_campaign_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("campaign_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_track" ADD CONSTRAINT "location_track_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "driver"("driver_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_track" ADD CONSTRAINT "location_track_driver_campaign_id_fkey" FOREIGN KEY ("driver_campaign_id") REFERENCES "driver_campaign"("driver_campaign_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location_point" ADD CONSTRAINT "location_point_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "location_track"("track_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_analytics" ADD CONSTRAINT "campaign_analytics_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaign"("campaign_id") ON DELETE CASCADE ON UPDATE CASCADE;
