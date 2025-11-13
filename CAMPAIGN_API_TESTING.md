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

## 7. Upload Wrap Design (Advertiser Only)

**POST** `/api/campaigns/:campaignId/upload-design`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Form Data:**

- `wrapDesign`: Image file (JPG, PNG, WebP)

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/campaigns/{campaignId}/upload-design \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "wrapDesign=@/path/to/design.jpg"
```

**PowerShell Example:**

```powershell
$headers = @{
    Authorization = "Bearer YOUR_JWT_TOKEN"
}

$form = @{
    wrapDesign = Get-Item -Path "C:\path\to\design.jpg"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/campaigns/$campaignId/upload-design" `
    -Method POST `
    -Headers $headers `
    -Form $form
```

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Wrap design uploaded successfully",
  "data": {
    "campaign": {
      "campaignId": "uuid",
      "campaignName": "Summer Campaign",
      "wrapDesignUrl": "https://res.cloudinary.com/your-cloud/image/upload/v123456789/car_wrap_ads/campaigns/design.jpg",
      "status": "draft",
      ...
    },
    "wrapDesignUrl": "https://res.cloudinary.com/your-cloud/image/upload/v123456789/car_wrap_ads/campaigns/design.jpg"
  }
}
```

**File Requirements:**

- **Format**: JPG, JPEG, PNG, WebP
- **Max Size**: 10 MB
- **Recommended Dimensions**: 1500x1000 pixels (auto-optimized)
- **Auto-optimization**: Quality and format optimized by Cloudinary

**Postman Setup:**

1. Method: POST
2. URL: `{{base_url}}/campaigns/{{campaign_id}}/upload-design`
3. Headers: `Authorization: Bearer {{advertiser_token}}`
4. Body → form-data
   - Key: `wrapDesign` (type: File)
   - Value: Select image file

**Postman Test Script:**

```javascript
pm.test("Status is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Wrap design URL returned", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data.wrapDesignUrl).to.be.a("string");
  pm.expect(jsonData.data.wrapDesignUrl).to.include("cloudinary.com");
});

pm.test("Campaign updated with design", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data.campaign.wrapDesignUrl).to.equal(
    jsonData.data.wrapDesignUrl
  );
});
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
2. **Upload wrap design** 🎨 (NEW!)
3. Set up campaign details, target areas
4. Activate campaign (status: `active`)
5. Drivers can now apply
6. Pause if needed (status: `paused`)
7. Resume (status: `active`)
8. End campaign (status: `completed`)

---

## Image Upload Features

### Cloudinary Integration

All wrap design images are:

- ✅ **Automatically optimized** for web delivery
- ✅ **Resized** to max 1500x1000 (maintains aspect ratio)
- ✅ **Quality optimized** based on content
- ✅ **Stored securely** on Cloudinary CDN
- ✅ **Fast delivery** globally

### Storage Structure

```
car_wrap_ads/
└── campaigns/
    ├── design_abc123.jpg
    ├── design_def456.png
    └── design_ghi789.webp
```

### Benefits

- **Fast Loading**: CDN-delivered images
- **Responsive**: Auto-format based on device
- **Secure**: HTTPS delivery
- **No Local Storage**: No server disk usage

---

## Next Steps

After Campaign API is working, you can implement:

- **Driver Application System** - Drivers apply to campaigns ✅ **DONE**
- **Campaign Target Areas** - Define geographic zones
- **Campaign Analytics** - Track performance

Campaign API with image upload is now ready! 🚀
