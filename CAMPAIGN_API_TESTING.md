# Campaign API Testing Guide

Base URL: `http://localhost:5000/api`

**Note:** All campaign endpoints require authentication. Include JWT token in Authorization header.

---

## Campaign Endpoints

### 1. Create Campaign (Advertiser Only)

**POST** `/api/campaigns`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:**

```json
{
  "campaignName": "Summer Brand Awareness Campaign 2025",
  "description": "Promote our new product line across Auckland city center",
  "startDate": "2025-12-01",
  "endDate": "2026-01-31",
  "paymentPerDay": 50.0,
  "requiredDrivers": 10,
  "wrapDesignUrl": "https://example.com/wrap-design.jpg"
}
```

**Required Fields:**

- `campaignName` (3-200 characters)
- `startDate` (ISO8601 format, future date)
- `endDate` (ISO8601 format, after start date)

**Optional Fields:**

- `description` (max 1000 characters)
- `paymentPerDay` (positive number)
- `requiredDrivers` (min 1, default: 1)
- `wrapDesignUrl` (valid URL)

**Success Response (201):**

```json
{
  "status": "success",
  "message": "Campaign created successfully",
  "data": {
    "campaign": {
      "campaignId": "uuid",
      "advertiserId": "uuid",
      "campaignName": "Summer Brand Awareness Campaign 2025",
      "description": "Promote our new product line across Auckland city center",
      "status": "draft",
      "startDate": "2025-12-01T00:00:00.000Z",
      "endDate": "2026-01-31T00:00:00.000Z",
      "paymentPerDay": 50.0,
      "requiredDrivers": 10,
      "wrapDesignUrl": "https://example.com/wrap-design.jpg",
      "createdAt": "2025-11-06T...",
      "updatedAt": "2025-11-06T..."
    }
  }
}
```

---

### 2. Get My Campaigns (Advertiser Only)

**GET** `/api/campaigns/my`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**No body needed**

**Success Response (200):**

```json
{
  "status": "success",
  "data": {
    "campaigns": [
      {
        "campaignId": "uuid",
        "campaignName": "Summer Brand Awareness Campaign 2025",
        "description": "...",
        "status": "draft",
        "startDate": "2025-12-01T00:00:00.000Z",
        "endDate": "2026-01-31T00:00:00.000Z",
        "paymentPerDay": 50.0,
        "requiredDrivers": 10,
        "driverCampaigns": [],
        "_count": {
          "driverCampaigns": 0
        },
        "createdAt": "2025-11-06T...",
        "updatedAt": "2025-11-06T..."
      }
    ]
  }
}
```

---

### 3. Get Campaign by ID

**GET** `/api/campaigns/:campaignId`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**No body needed**

**Success Response (200):**

```json
{
  "status": "success",
  "data": {
    "campaign": {
      "campaignId": "uuid",
      "campaignName": "Summer Brand Awareness Campaign 2025",
      "description": "...",
      "status": "draft",
      "startDate": "2025-12-01T00:00:00.000Z",
      "endDate": "2026-01-31T00:00:00.000Z",
      "paymentPerDay": 50.0,
      "requiredDrivers": 10,
      "wrapDesignUrl": "https://example.com/wrap-design.jpg",
      "advertiser": {
        "advertiserId": "uuid",
        "companyName": "Acme Corporation",
        "user": {
          "email": "advertiser@example.com"
        }
      },
      "driverCampaigns": [],
      "targetAreas": [],
      "createdAt": "2025-11-06T...",
      "updatedAt": "2025-11-06T..."
    }
  }
}
```

---

### 4. Update Campaign (Advertiser Only)

**PUT** `/api/campaigns/:campaignId`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body (all fields optional):**

```json
{
  "campaignName": "Updated Campaign Name",
  "description": "Updated description",
  "paymentPerDay": 60.0,
  "requiredDrivers": 15
}
```

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Campaign updated successfully",
  "data": {
    "campaign": {
      "campaignId": "uuid",
      "campaignName": "Updated Campaign Name",
      "description": "Updated description",
      "paymentPerDay": 60.00,
      "requiredDrivers": 15,
      ...
    }
  }
}
```

---

### 5. Update Campaign Status (Advertiser Only)

**PATCH** `/api/campaigns/:campaignId/status`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:**

```json
{
  "status": "active"
}
```

**Valid Status Values:**

- `draft` - Campaign is being prepared
- `active` - Campaign is live and accepting applications
- `paused` - Campaign temporarily stopped
- `completed` - Campaign finished
- `cancelled` - Campaign cancelled

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Campaign status updated successfully",
  "data": {
    "campaign": {
      "campaignId": "uuid",
      "status": "active",
      ...
    }
  }
}
```

---

### 6. Delete Campaign (Advertiser Only)

**DELETE** `/api/campaigns/:campaignId`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**No body needed**

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Campaign deleted successfully"
}
```

---

### 7. Get All Active Campaigns (For Drivers)

**GET** `/api/campaigns?page=1&limit=10&status=active&minPayment=30`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (default shows 'active' only)
- `minPayment` (optional): Minimum payment per day filter

**Success Response (200):**

```json
{
  "status": "success",
  "data": {
    "campaigns": [
      {
        "campaignId": "uuid",
        "campaignName": "Summer Brand Awareness Campaign 2025",
        "description": "...",
        "status": "active",
        "startDate": "2025-12-01T00:00:00.000Z",
        "endDate": "2026-01-31T00:00:00.000Z",
        "paymentPerDay": 50.0,
        "requiredDrivers": 10,
        "advertiser": {
          "advertiserId": "uuid",
          "companyName": "Acme Corporation",
          "city": "Auckland"
        },
        "_count": {
          "driverCampaigns": 3
        }
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "totalPages": 2
    }
  }
}
```

---

## Testing Workflow in Postman

### Complete Test Sequence:

**1. Register as Advertiser**

```json
POST /api/auth/register
{
  "email": "advertiser@example.com",
  "password": "password123",
  "userType": "advertiser"
}
```

_Copy JWT token_

**2. Create Advertiser Profile**

```json
POST /api/advertisers
Authorization: Bearer YOUR_TOKEN
{
  "companyName": "Acme Corporation",
  "contactPerson": "Jane Smith",
  "city": "Auckland",
  "industry": "Technology"
}
```

**3. Create Campaign**

```json
POST /api/campaigns
Authorization: Bearer YOUR_TOKEN
{
  "campaignName": "Summer Campaign 2025",
  "description": "Brand awareness in Auckland CBD",
  "startDate": "2025-12-01",
  "endDate": "2026-01-31",
  "paymentPerDay": 50.00,
  "requiredDrivers": 10
}
```

_Copy campaignId_

**4. Get My Campaigns**

```
GET /api/campaigns/my
Authorization: Bearer YOUR_TOKEN
```

**5. Update Campaign**

```json
PUT /api/campaigns/:campaignId
Authorization: Bearer YOUR_TOKEN
{
  "paymentPerDay": 60.00
}
```

**6. Update Campaign Status to Active**

```json
PATCH /api/campaigns/:campaignId/status
Authorization: Bearer YOUR_TOKEN
{
  "status": "active"
}
```

**7. Test as Driver - View Active Campaigns**

```
Register/Login as driver
GET /api/campaigns
Authorization: Bearer DRIVER_TOKEN
```

---

## Common Errors

### 400 - End Date Before Start Date

```json
{
  "status": "error",
  "message": "End date must be after start date"
}
```

### 400 - Start Date in Past

```json
{
  "status": "error",
  "message": "Start date cannot be in the past"
}
```

### 403 - Not Advertiser

```json
{
  "status": "error",
  "message": "Only advertisers can create campaigns"
}
```

### 403 - Not Your Campaign

```json
{
  "status": "error",
  "message": "You do not have permission to update this campaign"
}
```

### 404 - Advertiser Profile Not Found

```json
{
  "status": "error",
  "message": "Advertiser profile not found. Please create an advertiser profile first."
}
```

### 404 - Campaign Not Found

```json
{
  "status": "error",
  "message": "Campaign not found"
}
```

---

## Campaign Status Flow

```
draft → active → paused → active → completed
                    ↓
                 cancelled
```

**Typical Workflow:**

1. Create campaign (status: `draft`)
2. Set up campaign details, target areas
3. Activate campaign (status: `active`)
4. Drivers can now apply
5. Pause if needed (status: `paused`)
6. Resume (status: `active`)
7. End campaign (status: `completed`)

---

## Next Steps

After Campaign API is working, you can implement:

- **Driver Application System** - Drivers apply to campaigns
- **Campaign Target Areas** - Define geographic zones
- **Campaign Analytics** - Track performance

Campaign API is now ready! 🚀
