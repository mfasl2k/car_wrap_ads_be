# Car Wrap Ads Backend - Database Schema

## Overview

This project uses **Prisma ORM** with **PostgreSQL** and **PostGIS** for location-based features.

## Database Schema

### Core Tables

#### 1. **User** - Authentication & User Management

- `user_id` (UUID, Primary Key)
- `email` (Unique)
- `password_hash`
- `user_type` (ENUM: 'driver' | 'advertiser')
- `is_active`, `is_verified`
- Timestamps: `created_at`, `updated_at`

#### 2. **Driver** - Driver Profiles

- `driver_id` (UUID, Primary Key)
- `user_id` (FK → User)
- Personal info: `first_name`, `last_name`, `phone_number`, `date_of_birth`
- `drivers_license_number` (Unique)
- Location: `city`, `region`, **`current_location` (PostGIS POINT)**
- Stats: `average_rating`, `total_campaigns_completed`
- `is_verified`

#### 3. **Vehicle** - Driver's Vehicles

- `vehicle_id` (UUID, Primary Key)
- `driver_id` (FK → Driver)
- Details: `make`, `model`, `year`, `color`
- `registration_number` (Unique)
- `vehicle_type` (ENUM: sedan, suv, van, truck, hatchback)
- `size_category` (ENUM: small, medium, large)
- `photo_url`, `is_verified`

#### 4. **Advertiser** - Advertiser Profiles

- `advertiser_id` (UUID, Primary Key)
- `user_id` (FK → User)
- Business info: `company_name`, `contact_person`, `phone_number`
- `business_address`, `city`, `industry`
- `is_verified`

#### 5. **Notification** - User Notifications

- `notification_id` (UUID, Primary Key)
- `user_id` (FK → User)
- `title`, `message`
- `is_read`

### PostGIS Tables

#### 6. **DriverRoute** - Track Driver Paths

- `route_id` (UUID, Primary Key)
- `driver_id` (FK → Driver)
- **`route_path` (PostGIS LINESTRING)** - GPS path
- `start_time`, `end_time`
- `distance` (Decimal, km)

#### 7. **CampaignArea** - Campaign Target Areas

- `area_id` (UUID, Primary Key)
- `advertiser_id` (FK → Advertiser)
- `area_name`
- **`target_area` (PostGIS POLYGON)** - Geographic boundary
- `description`

## PostGIS Geometry Types

### 1. POINT (GPS Coordinates)

Used for: Driver current location

```typescript
import { createPoint } from "./src/utils/postgis";

// Create a point (latitude, longitude)
const location = createPoint(40.7128, -74.006); // New York
// Result: "SRID=4326;POINT(-74.0060 40.7128)"
```

### 2. LINESTRING (Routes/Paths)

Used for: Driver routes

```typescript
import { createLineString } from "./src/utils/postgis";

// Array of [lat, lng] coordinates
const route = createLineString([
  [40.7128, -74.006],
  [40.758, -73.9855],
  [40.7614, -73.9776],
]);
```

### 3. POLYGON (Target Areas)

Used for: Campaign target areas

```typescript
import { createPolygon } from "./src/utils/postgis";

// Define a rectangular area
const area = createPolygon([
  [40.7128, -74.006],
  [40.758, -74.006],
  [40.758, -73.9855],
  [40.7128, -73.9855],
  [40.7128, -74.006], // Close the polygon
]);
```

## Setup Instructions

### 1. Install PostgreSQL with PostGIS

Download PostGIS from: https://postgis.net/windows_downloads/

### 2. Configure Database URL

Update `.env` file with your database connection:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

### 3. Run Migration

```bash
npx prisma migrate dev
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Start Development Server

```bash
npm run dev
```

## Common PostGIS Queries

### Find Drivers Near a Location

```typescript
import prisma from "./src/db";

const driversNearby = await prisma.$queryRaw`
  SELECT * FROM driver 
  WHERE ST_DWithin(
    current_location,
    ST_SetSRID(ST_MakePoint(-74.0060, 40.7128), 4326)::geography,
    5000  -- 5km radius
  )
`;
```

### Check Route Intersection with Campaign Area

```typescript
const intersections = await prisma.$queryRaw`
  SELECT dr.*, ca.* 
  FROM driver_route dr
  JOIN campaign_area ca ON ST_Intersects(dr.route_path, ca.target_area)
  WHERE dr.driver_id = ${driverId}
`;
```

### Calculate Distance Between Points

```typescript
const result = await prisma.$queryRaw`
  SELECT ST_Distance(
    ST_SetSRID(ST_MakePoint(-74.0060, 40.7128), 4326)::geography,
    ST_SetSRID(ST_MakePoint(-73.9855, 40.7580), 4326)::geography
  ) as distance_meters
`;
```

## API Endpoints

### Health Check

```
GET /health
```

Returns database connection status.

## Project Structure

```
car_wrap_ads_be/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Migration files
├── src/
│   ├── index.ts              # Main application
│   ├── db.ts                 # Prisma client
│   └── utils/
│       └── postgis.ts        # PostGIS helper functions
├── .env                      # Environment variables
└── package.json
```

## Next Steps

1. ✅ Database schema implemented
2. ✅ PostGIS integration configured
3. 🔲 Add authentication (JWT/bcrypt)
4. 🔲 Create API routes for CRUD operations
5. 🔲 Implement campaign matching logic
6. 🔲 Add real-time location tracking
7. 🔲 Build driver route recording
8. 🔲 Add payment/earning system

## Useful Commands

```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (DEV ONLY!)
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# Format Prisma schema
npx prisma format
```
