# Campaign Target Area API - Testing Guide

This guide covers the Campaign Target Area API with **district-based geographic targeting** for Auckland suburbs.

## 📍 Overview

Target areas allow advertisers to select pre-defined Auckland suburbs/districts for their campaign ads. The system uses **100+ Auckland districts** with PostGIS polygon boundaries for precise spatial queries.

**Key Benefits:**

- ✅ No need to draw polygons manually
- ✅ Consistent, standardized district boundaries
- ✅ 100+ Auckland suburbs covered (CBD, North Shore, South Auckland, West, East)
- ✅ Population and area statistics included
- ✅ Easy dropdown/search selection in UI

**Base URL:** `http://localhost:3000/api`

---

## 🗺️ District System

The system includes **100 pre-seeded Auckland districts** organized by region:

| Region           | Districts       | Population    |
| ---------------- | --------------- | ------------- |
| Auckland Central | 23 suburbs      | 267,500       |
| Central Auckland | 5 suburbs       | 57,500        |
| Eastern Suburbs  | 14 suburbs      | 241,400       |
| North Shore      | 22 suburbs      | 234,700       |
| South Auckland   | 16 suburbs      | 397,100       |
| Western Suburbs  | 20 suburbs      | 258,100       |
| **TOTAL**        | **100 suburbs** | **1,456,300** |

**Example Districts:**

- Auckland CBD, Parnell, Newmarket, Ponsonby, Grey Lynn
- Mission Bay, St Heliers, Remuera, Epsom, Mount Eden
- Takapuna, Devonport, Albany, Browns Bay
- Manukau, Papakura, Mangere, Otara, Flat Bush
- Henderson, New Lynn, Avondale, Glen Eden
- Howick, Botany Downs, Pakuranga, Highland Park

---

## 🔐 Authentication

Most endpoints are **public** (no authentication required), except creating/updating target areas:

**Public Endpoints:**

- GET `/api/districts` - List all districts
- GET `/api/districts/:districtId` - Get district details
- GET `/api/districts/by-city` - Group districts by city
- POST `/api/districts/check-point` - Check if GPS point is in district

**Protected Endpoints:**

```
Authorization: Bearer <your_jwt_token>
```

- POST `/api/campaigns/:campaignId/target-areas` - Add district to campaign
- PUT `/api/target-areas/:areaId` - Update priority level
- DELETE `/api/target-areas/:areaId` - Remove district from campaign

**Access Control:**

- **Advertisers**: Can add/update/delete districts for their campaigns
- **Drivers/Others**: Can view districts (read-only)

---

## 📡 API Endpoints

## District Endpoints (Public)

### 1. List All Districts

**GET** `/api/districts`

**Access:** Public

**Description:** Get list of all available Auckland districts

#### Query Parameters

| Parameter  | Type    | Description                             |
| ---------- | ------- | --------------------------------------- |
| `city`     | string  | Filter by city (e.g., "Auckland")       |
| `region`   | string  | Filter by region (e.g., "North Shore")  |
| `isActive` | boolean | Filter active districts (default: true) |

#### Request Example

```bash
# Get all districts
curl http://localhost:3000/api/districts

# Filter by region
curl http://localhost:3000/api/districts?region=North%20Shore

# Filter by city and region
curl http://localhost:3000/api/districts?city=Auckland&region=Auckland%20Central
```

#### Response Example

```json
{
  "status": "success",
  "results": 100,
  "data": {
    "districts": [
      {
        "districtId": "123e4567-e89b-12d3-a456-426614174000",
        "districtName": "Auckland CBD",
        "city": "Auckland",
        "region": "Auckland Central",
        "population": 55000,
        "areaKm2": 2.5,
        "isActive": true,
        "createdAt": "2025-11-13T12:00:00.000Z",
        "coordinates": [
          [174.748, -36.83],
          [174.782, -36.83],
          [174.782, -36.862],
          [174.748, -36.862],
          [174.748, -36.83]
        ],
        "geoJson": {
          "type": "Polygon",
          "coordinates": [
            [
              [174.748, -36.83],
              [174.782, -36.83],
              [174.782, -36.862],
              [174.748, -36.862],
              [174.748, -36.83]
            ]
          ]
        }
      }
      // ... more districts
    ]
  }
}
```

---

### 2. Get District by ID

**GET** `/api/districts/:districtId`

**Access:** Public

**Description:** Get detailed information about a specific district

#### Request Example

```bash
curl http://localhost:3000/api/districts/123e4567-e89b-12d3-a456-426614174000
```

#### Response Example

```json
{
  "status": "success",
  "data": {
    "district": {
      "districtId": "123e4567-e89b-12d3-a456-426614174000",
      "districtName": "Auckland CBD",
      "city": "Auckland",
      "region": "Auckland Central",
      "population": 55000,
      "areaKm2": 2.5,
      "isActive": true,
      "createdAt": "2025-11-13T12:00:00.000Z",
      "coordinates": [
        [174.748, -36.83],
        [174.782, -36.83],
        [174.782, -36.862],
        [174.748, -36.862],
        [174.748, -36.83]
      ],
      "geoJson": {
        "type": "Polygon",
        "coordinates": [
          [
            [174.748, -36.83],
            [174.782, -36.83],
            [174.782, -36.862],
            [174.748, -36.862],
            [174.748, -36.83]
          ]
        ]
      }
    }
  }
}
```

---

### 3. Group Districts by City

**GET** `/api/districts/by-city`

**Access:** Public

**Description:** Get districts grouped by city with aggregate statistics

#### Request Example

```bash
curl http://localhost:3000/api/districts/by-city
```

#### Response Example

```json
{
  "status": "success",
  "data": {
    "cities": [
      {
        "city": "Auckland",
        "districtCount": 100,
        "totalPopulation": 1456300,
        "totalArea": 450.5,
        "districts": [
          {
            "districtId": "123e4567-e89b-12d3-a456-426614174000",
            "districtName": "Auckland CBD",
            "region": "Auckland Central",
            "population": 55000,
            "areaKm2": 2.5
          }
          // ... more districts
        ]
      }
    ]
  }
}
```

---

### 4. Check Point in District

**POST** `/api/districts/check-point`

**Access:** Public

**Description:** Find which district contains a GPS coordinate (reverse geocoding)

#### Request Body

```json
{
  "latitude": -36.8485,
  "longitude": 174.7633
}
```

#### Field Validations

| Field       | Type   | Required | Validation  |
| ----------- | ------ | -------- | ----------- |
| `latitude`  | number | Yes      | -90 to 90   |
| `longitude` | number | Yes      | -180 to 180 |

#### Request Example

```bash
curl -X POST http://localhost:3000/api/districts/check-point \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -36.8485,
    "longitude": 174.7633
  }'
```

#### Response Example

```json
{
  "status": "success",
  "data": {
    "found": true,
    "district": {
      "districtId": "123e4567-e89b-12d3-a456-426614174000",
      "districtName": "Auckland CBD",
      "city": "Auckland",
      "region": "Auckland Central",
      "population": 55000,
      "areaKm2": 2.5
    },
    "point": {
      "latitude": -36.8485,
      "longitude": 174.7633
    }
  }
}
```

---

## Campaign Target Area Endpoints (Protected)

### 5. Add District to Campaign

**POST** `/api/campaigns/:campaignId/target-areas`

**Access:** Advertiser only (requires authentication)

**Description:** Add a pre-defined district to campaign target areas

#### Request Body

```json
{
  "districtId": "123e4567-e89b-12d3-a456-426614174000",
  "priorityLevel": 10
}
```

#### Field Descriptions

| Field           | Type   | Required | Description                              |
| --------------- | ------ | -------- | ---------------------------------------- |
| `districtId`    | UUID   | Yes      | ID of the district to add                |
| `priorityLevel` | number | Optional | 1-10 (10 = highest priority), default: 5 |

\*Either `coordinates` or `geoJson` must be provided

#### Priority Levels

- **10**: High priority (CBD, main commercial areas)
- **7-9**: Medium-high (popular suburbs, shopping districts)
- **4-6**: Medium (standard residential areas)
- **1-3**: Low (outer suburbs, rural areas)

#### Workflow

1. Call `GET /api/districts` to list available districts
2. User selects district from dropdown/map
3. Call `POST /api/campaigns/:campaignId/target-areas` with `districtId`
4. District is added to campaign

#### cURL Example

```bash
# First, get available districts
curl http://localhost:3000/api/districts?region=Auckland%20Central

# Then add a district to campaign
curl -X POST http://localhost:3000/api/campaigns/550e8400-e29b-41d4-a716-446655440000/target-areas \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "districtId": "123e4567-e89b-12d3-a456-426614174000",
    "priorityLevel": 10
  }'
```

#### PowerShell Example

```powershell
$headers = @{
    Authorization = "Bearer $advertiserToken"
}

# First, get districts
$districts = Invoke-RestMethod -Uri "http://localhost:3000/api/districts?region=Auckland Central" -Method GET

# Then add district to campaign
$body = @{
    districtId = "123e4567-e89b-12d3-a456-426614174000"
    priorityLevel = 10
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/campaigns/$campaignId/target-areas" `
    -Method POST `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $body
```

#### Success Response (201 Created)

```json
{
  "status": "success",
  "message": "District added to campaign successfully",
  "data": {
    "targetArea": {
      "targetAreaId": "uuid-here",
      "campaignId": "550e8400-e29b-41d4-a716-446655440000",
      "districtId": "123e4567-e89b-12d3-a456-426614174000",
      "districtName": "Auckland CBD",
      "city": "Auckland",
      "region": "Auckland Central",
      "population": 55000,
      "areaKm2": 2.5,
      "priorityLevel": 10,
      "createdAt": "2025-11-13T10:30:00.000Z",
      "coordinates": [
        [174.748, -36.83],
        [174.782, -36.83],
        [174.782, -36.862],
        [174.748, -36.862],
        [174.748, -36.83]
      ],
      "geoJson": {
        "type": "Polygon",
        "coordinates": [
          [
            [174.748, -36.83],
            [174.782, -36.83],
            [174.782, -36.862],
            [174.748, -36.862],
            [174.748, -36.83]
          ]
        ]
      }
    }
  }
}
```

#### Error Responses

```json
// District not found
{
  "status": "error",
  "message": "District not found"
}

// District already added
{
  "status": "error",
  "message": "This district is already added to the campaign"
}

// District not active
{
  "status": "error",
  "message": "This district is not currently available"
}
```

---

### 6. Get Campaign Target Areas

**GET** `/api/campaigns/:campaignId/target-areas`

**Access:** Public

**Description:** Retrieve all districts assigned to a campaign

#### cURL Example

```bash
curl http://localhost:3000/api/campaigns/550e8400-e29b-41d4-a716-446655440000/target-areas
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "targetAreas": [
      {
        "targetAreaId": "uuid-1",
        "campaignId": "550e8400-e29b-41d4-a716-446655440000",
        "districtId": "123e4567-e89b-12d3-a456-426614174000",
        "districtName": "Auckland CBD",
        "city": "Auckland",
        "region": "Auckland Central",
        "population": 55000,
        "areaKm2": 2.5,
        "priorityLevel": 10,
        "createdAt": "2025-11-13T10:30:00.000Z",
        "coordinates": [[174.7480, -36.8300], ...],
        "geoJson": {
          "type": "Polygon",
          "coordinates": [[[174.7480, -36.8300], ...]]
        }
      },
      {
        "targetAreaId": "uuid-2",
        "campaignId": "550e8400-e29b-41d4-a716-446655440000",
        "districtId": "456e7890-e12b-34c5-d678-901234567890",
        "districtName": "Takapuna",
        "city": "Auckland",
        "region": "North Shore",
        "population": 11000,
        "areaKm2": 3.1,
        "priorityLevel": 8,
        "createdAt": "2025-11-13T11:00:00.000Z",
        "coordinates": [[174.7780, -36.7880], ...],
        "geoJson": {
          "type": "Polygon",
          "coordinates": [[[174.7780, -36.7880], ...]]
        }
      }
    ],
    "count": 2
  }
}
```

---

### 7. Get Single Target Area

**GET** `/api/target-areas/:areaId`

**Access:** Public

**Description:** Get details of a specific target area assignment

#### cURL Example

```bash
curl http://localhost:3000/api/target-areas/uuid-here
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "targetArea": {
      "targetAreaId": "uuid-here",
      "campaignId": "550e8400-e29b-41d4-a716-446655440000",
      "districtId": "123e4567-e89b-12d3-a456-426614174000",
      "districtName": "Auckland CBD",
      "city": "Auckland",
      "region": "Auckland Central",
      "population": 55000,
      "areaKm2": 2.5,
      "priorityLevel": 10,
      "createdAt": "2025-11-13T10:30:00.000Z",
      "coordinates": [[174.7480, -36.8300], ...],
      "geoJson": {
        "type": "Polygon",
        "coordinates": [[[174.7480, -36.8300], ...]]
      }
    }
  }
}
```

---

### 8. Update Target Area Priority

**PUT** `/api/target-areas/:areaId`

**Access:** Advertiser only (campaign owner)

**Description:** Update the priority level of a target area

**Request:**

```json
{
  "priorityLevel": 9
}
```

**Note:** Only priority level can be updated. Cannot change the district itself (delete and re-add instead).

#### cURL Example

```bash
curl -X PUT http://localhost:3000/api/target-areas/uuid-here \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priorityLevel": 9
  }'
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Target area updated successfully",
  "data": {
    "targetArea": {
      "targetAreaId": "uuid-here",
      "campaignId": "550e8400-e29b-41d4-a716-446655440000",
      "districtId": "123e4567-e89b-12d3-a456-426614174000",
      "districtName": "Auckland CBD",
      "city": "Auckland",
      "region": "Auckland Central",
      "population": 55000,
      "areaKm2": 2.5,
      "priorityLevel": 9,
      "createdAt": "2025-11-13T10:30:00.000Z",
      "coordinates": [[174.7480, -36.8300], ...],
      "geoJson": { ... }
    }
  }
}
```

---

### 5. Delete Target Area

**DELETE** `/api/target-areas/:areaId`

**Access:** Advertiser only (campaign owner)

**Description:** Remove a target area from campaign

#### cURL Example

```bash
curl -X DELETE http://localhost:3000/api/target-areas/uuid-here \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Success Response (200 OK)

```json
{
  "status": "success",
  "message": "Target area deleted successfully"
}
```

---

## 🧪 Testing Workflow

### Complete Example: Adding Districts to Campaign

```bash
# 1. Get your authentication token (as advertiser)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "advertiser@example.com", "password": "password123"}'

# Save the token from response
export TOKEN="your_jwt_token_here"

# 2. List available districts
curl http://localhost:3000/api/districts

# 3. Filter districts by region
curl "http://localhost:3000/api/districts?region=Auckland%20Central"

# 4. Add Auckland CBD to campaign
curl -X POST http://localhost:3000/api/campaigns/YOUR_CAMPAIGN_ID/target-areas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "districtId": "AUCKLAND_CBD_DISTRICT_ID",
    "priorityLevel": 10
  }'

# 5. Add Takapuna to campaign
curl -X POST http://localhost:3000/api/campaigns/YOUR_CAMPAIGN_ID/target-areas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "districtId": "TAKAPUNA_DISTRICT_ID",
    "priorityLevel": 8
  }'

# 6. View all target areas for campaign
curl http://localhost:3000/api/campaigns/YOUR_CAMPAIGN_ID/target-areas

# 7. Update priority level
curl -X PUT http://localhost:3000/api/target-areas/TARGET_AREA_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"priorityLevel": 9}'

# 8. Check if GPS point is in campaign districts
curl -X POST http://localhost:3000/api/districts/check-point \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -36.8485,
    "longitude": 174.7633
  }'

# 9. Remove a district from campaign
curl -X DELETE http://localhost:3000/api/target-areas/TARGET_AREA_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎨 Frontend Integration (Leaflet)

### Drawing Polygon on Map

```javascript
// Initialize map
const map = L.map("map").setView([-36.8485, 174.765], 13);

// Add tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Enable drawing
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnItems,
  },
  draw: {
    polygon: true,
    marker: false,
    circle: false,
    rectangle: true,
    polyline: false,
    circlemarker: false,
  },
});
map.addControl(drawControl);

// Handle polygon creation
map.on("draw:created", async function (e) {
  const layer = e.layer;
  drawnItems.addLayer(layer);

  // Get coordinates
  const latlngs = layer.getLatLngs()[0];
  const coordinates = latlngs.map((latlng) => [latlng.lng, latlng.lat]);

  // Send to backend
  try {
    const response = await fetch(`/api/campaigns/${campaignId}/target-areas`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        areaName: prompt("Enter area name:"),
        coordinates: coordinates,
        priorityLevel: 10,
      }),
    });

    const data = await response.json();
    console.log("Target area created:", data);

    // Bind popup
    layer.bindPopup(`
      <b>${data.data.targetArea.areaName}</b><br>
      Priority: ${data.data.targetArea.priorityLevel}/10
    `);
  } catch (error) {
    console.error("Error creating target area:", error);
    drawnItems.removeLayer(layer);
  }
});
```

### Displaying Existing Target Areas

```javascript
// Fetch and display target areas
async function loadTargetAreas(campaignId) {
  try {
    const response = await fetch(`/api/campaigns/${campaignId}/target-areas`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    data.data.targetAreas.forEach((area) => {
      // Convert coordinates to Leaflet format [lat, lng]
      const latlngs = area.coordinates.map((coord) => [coord[1], coord[0]]);

      // Color by priority
      const color = getPriorityColor(area.priorityLevel);

      // Draw polygon
      const polygon = L.polygon(latlngs, {
        color: color,
        fillColor: color,
        fillOpacity: 0.3,
        weight: 2,
      }).addTo(map);

      // Add popup
      polygon.bindPopup(`
        <b>${area.areaName || "Unnamed Area"}</b><br>
        Priority: ${area.priorityLevel}/10<br>
        <button onclick="editArea('${area.areaId}')">Edit</button>
        <button onclick="deleteArea('${area.areaId}')">Delete</button>
      `);
    });
  } catch (error) {
    console.error("Error loading target areas:", error);
  }
}

function getPriorityColor(priority) {
  if (priority >= 8) return "#ff0000"; // Red - High
  if (priority >= 5) return "#ff9900"; // Orange - Medium
  return "#00ff00"; // Green - Low
}
```

---

## 🧪 Testing Workflow

### Complete Test Flow

```bash
# 1. Create campaign (as advertiser)
POST /api/campaigns
{
  "campaignName": "Auckland Summer Campaign",
  "startDate": "2025-12-01",
  "endDate": "2025-12-31",
  "requiredDrivers": 5
}
# Save campaignId from response

# 2. Activate campaign
PATCH /api/campaigns/{campaignId}/status
{
  "status": "active"
}

# 3. Create target area (Auckland CBD)
POST /api/campaigns/{campaignId}/target-areas
{
  "areaName": "Auckland CBD",
  "coordinates": [
    [174.7633, -36.8485],
    [174.7733, -36.8485],
    [174.7733, -36.8585],
    [174.7633, -36.8585],
    [174.7633, -36.8485]
  ],
  "priorityLevel": 10
}
# Save areaId from response

# 4. Create second target area (North Shore)
POST /api/campaigns/{campaignId}/target-areas
{
  "areaName": "North Shore",
  "coordinates": [
    [174.7400, -36.7800],
    [174.7800, -36.7800],
    [174.7800, -36.8200],
    [174.7400, -36.8200],
    [174.7400, -36.7800]
  ],
  "priorityLevel": 7
}

# 5. Get all target areas
GET /api/campaigns/{campaignId}/target-areas

# 6. Check if point is in target area
POST /api/campaigns/{campaignId}/target-areas/check-point
{
  "latitude": -36.8500,
  "longitude": 174.7650
}

# 7. Update target area
PUT /api/target-areas/{areaId}
{
  "priorityLevel": 9
}

# 8. Delete target area
DELETE /api/target-areas/{areaId}
```

---

## ❌ Error Responses

### 400 Bad Request - Invalid Coordinates

```json
{
  "errors": [
    {
      "msg": "Coordinates must be an array with at least 3 points",
      "param": "coordinates"
    }
  ]
}
```

### 400 Bad Request - Missing Required Field

```json
{
  "errors": [
    {
      "msg": "Either coordinates or geoJson must be provided"
    }
  ]
}
```

### 403 Forbidden - Not Campaign Owner

```json
{
  "status": "error",
  "message": "You can only create target areas for your own campaigns"
}
```

### 404 Not Found

```json
{
  "status": "error",
  "message": "Campaign not found"
}
```

---

## 📊 Real-World Examples

### Example 1: Coffee Shop Chain

```json
{
  "areaName": "Downtown Auckland",
  "coordinates": [
    [174.76, -36.845],
    [174.77, -36.845],
    [174.77, -36.855],
    [174.76, -36.855],
    [174.76, -36.845]
  ],
  "priorityLevel": 10
}
```

### Example 2: Suburban Coverage

```json
{
  "areaName": "Residential Suburbs",
  "coordinates": [
    [174.72, -36.75],
    [174.78, -36.75],
    [174.78, -36.8],
    [174.72, -36.8],
    [174.72, -36.75]
  ],
  "priorityLevel": 5
}
```

---

## 🎯 Use Cases

### 1. Geographic Targeting

- Define precise campaign boundaries
- Multiple areas per campaign
- Priority-based targeting

### 2. Impression Counting

- Track when drivers enter target areas
- Count time spent in high-priority zones
- Calculate weighted impressions

### 3. Driver Matching

- Match drivers who live/work in target areas
- Bonus points for frequent coverage
- Route optimization suggestions

---

## 📝 Postman Collection

Save these requests in Postman:

**Collection Variables:**

- `base_url`: `http://localhost:3000/api`
- `advertiser_token`: Your advertiser JWT token
- `campaign_id`: UUID of your campaign
- `area_id`: UUID of target area

**Test Scripts:**

```javascript
// After creating target area
pm.test("Target area created", function () {
  pm.response.to.have.status(201);
  const jsonData = pm.response.json();
  pm.expect(jsonData.data.targetArea.areaId).to.be.a("string");
  pm.environment.set("area_id", jsonData.data.targetArea.areaId);
});

// After checking point
pm.test("Point check works", function () {
  pm.response.to.have.status(200);
  const jsonData = pm.response.json();
  pm.expect(jsonData.data).to.have.property("isInTargetArea");
  pm.expect(jsonData.data).to.have.property("matchedAreas");
});
```

---

## 🚀 Next Steps

After implementing target areas:

1. ✅ **Target Area API** - Complete!
2. ⏳ **Basic Location Tracking** - Record driver GPS points
3. ⏳ **Route Intersection** - Check if routes cross target areas
4. ⏳ **Impression Calculation** - Count impressions based on coverage
5. ⏳ **Analytics Dashboard** - Visualize coverage heatmaps

---

**Target Area API is ready for Leaflet integration!** 🎉

Use this API to create, manage, and query geographic target areas for your campaigns.
