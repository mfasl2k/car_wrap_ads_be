# Driver Application System API Testing Guide

This document provides comprehensive testing instructions for the Driver Application System APIs.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Driver Application Endpoints](#driver-application-endpoints)
- [Advertiser Management Endpoints](#advertiser-management-endpoints)
- [Testing Workflow](#testing-workflow)
- [Error Responses](#error-responses)

---

## Overview

The Driver Application System allows drivers to:

- Apply to active campaigns
- View their application history
- Cancel pending applications

And allows advertisers to:

- View applications for their campaigns
- Approve driver applications
- Reject driver applications with reasons

### Matching Score Algorithm

When a driver applies to a campaign, a matching score (0-100) is calculated based on:

- **Vehicle Verification (50 points)**: Has verified vehicle
- **Driver Rating (30 points)**: Based on average rating (0-5 scale, normalized)
- **Active Driver Bonus (20 points)**: Verified vehicle status

---

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

**Role-Based Access:**

- Driver endpoints require `userType: 'driver'`
- Advertiser endpoints require `userType: 'advertiser'`

---

## Driver Application Endpoints

### 1. Apply to Campaign

Apply to an active campaign.

**Endpoint:** `POST /api/campaigns/:campaignId/apply`

**Access:** Private (Driver only)

**Prerequisites:**

- Driver must have a profile
- Driver must have at least one registered vehicle
- At least one vehicle must be verified
- Campaign must exist and be active
- Campaign must be within valid dates (started but not ended)
- Driver cannot have already applied to this campaign

**Request:**

```http
POST /api/campaigns/550e8400-e29b-41d4-a716-446655440000/apply
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "driverCampaignId": "123e4567-e89b-12d3-a456-426614174000",
    "driverId": "driver-uuid-here",
    "campaignId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending",
    "matchScore": 85.0,
    "appliedAt": "2025-11-06T10:30:00.000Z",
    "createdAt": "2025-11-06T10:30:00.000Z",
    "campaign": {
      "campaignId": "550e8400-e29b-41d4-a716-446655440000",
      "campaignName": "Summer Promo 2025",
      "description": "Promote summer products",
      "status": "active",
      "startDate": "2025-06-01",
      "endDate": "2025-08-31",
      "paymentPerDay": "150.00",
      "advertiser": {
        "advertiserId": "adv-uuid-here",
        "companyName": "ABC Marketing Ltd"
      }
    },
    "driver": {
      "driverId": "driver-uuid-here",
      "firstName": "John",
      "lastName": "Doe",
      "averageRating": "4.50",
      "vehicles": [
        {
          "vehicleId": "vehicle-uuid-here",
          "make": "Toyota",
          "model": "Camry",
          "year": 2020,
          "isVerified": true
        }
      ]
    }
  }
}
```

**Error Responses:**

```json
// No driver profile
{
  "success": false,
  "message": "Driver profile not found. Please create your driver profile first."
}

// No vehicle registered
{
  "success": false,
  "message": "You must have a registered vehicle to apply to campaigns."
}

// Vehicle not verified
{
  "success": false,
  "message": "You must have at least one verified vehicle before applying to campaigns."
}

// Campaign not active
{
  "success": false,
  "message": "Cannot apply to draft campaign. Campaign must be active."
}

// Campaign not started
{
  "success": false,
  "message": "Campaign has not started yet."
}

// Already applied
{
  "success": false,
  "message": "You have already applied to this campaign. Current status: pending"
}
```

---

### 2. Get My Applications

Get all applications for the authenticated driver.

**Endpoint:** `GET /api/campaigns/applications/my`

**Access:** Private (Driver only)

**Query Parameters:**

- `status` (optional): Filter by status (pending, approved, rejected, active, completed)

**Request:**

```http
GET /api/campaigns/applications/my?status=pending
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "driverCampaignId": "123e4567-e89b-12d3-a456-426614174000",
      "driverId": "driver-uuid-here",
      "campaignId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "pending",
      "matchScore": "85.00",
      "appliedAt": "2025-11-06T10:30:00.000Z",
      "approvedAt": null,
      "rejectionReason": null,
      "campaign": {
        "campaignId": "550e8400-e29b-41d4-a716-446655440000",
        "campaignName": "Summer Promo 2025",
        "description": "Promote summer products",
        "status": "active",
        "startDate": "2025-06-01",
        "endDate": "2025-08-31",
        "paymentPerDay": "150.00",
        "advertiser": {
          "advertiserId": "adv-uuid-here",
          "companyName": "ABC Marketing Ltd"
        }
      }
    }
  ],
  "statistics": {
    "total": 5,
    "pending": 2,
    "approved": 2,
    "rejected": 1
  }
}
```

---

### 3. Cancel Application

Cancel a pending application.

**Endpoint:** `DELETE /api/campaigns/:campaignId/apply`

**Access:** Private (Driver only)

**Prerequisites:**

- Application must exist
- Application status must be 'pending'

**Request:**

```http
DELETE /api/campaigns/550e8400-e29b-41d4-a716-446655440000/apply
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Application cancelled successfully"
}
```

**Error Responses:**

```json
// Application not found
{
  "success": false,
  "message": "Application not found"
}

// Cannot cancel non-pending application
{
  "success": false,
  "message": "Cannot cancel application with status: approved"
}
```

---

## Advertiser Management Endpoints

### 4. Get Campaign Applications

View all applications for a specific campaign.

**Endpoint:** `GET /api/campaigns/:campaignId/applications`

**Access:** Private (Advertiser only)

**Prerequisites:**

- Campaign must belong to the advertiser

**Query Parameters:**

- `status` (optional): Filter by status (pending, approved, rejected, active, completed)

**Request:**

```http
GET /api/campaigns/550e8400-e29b-41d4-a716-446655440000/applications?status=pending
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "driverCampaignId": "123e4567-e89b-12d3-a456-426614174000",
      "driverId": "driver-uuid-here",
      "campaignId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "pending",
      "matchScore": "85.00",
      "appliedAt": "2025-11-06T10:30:00.000Z",
      "driver": {
        "driverId": "driver-uuid-here",
        "firstName": "John",
        "lastName": "Doe",
        "phoneNumber": "+1234567890",
        "city": "Los Angeles",
        "averageRating": "4.50",
        "totalCampaignsCompleted": 5,
        "isVerified": true,
        "vehicles": [
          {
            "vehicleId": "vehicle-uuid-here",
            "make": "Toyota",
            "model": "Camry",
            "year": 2020,
            "vehicleType": "sedan",
            "isVerified": true
          }
        ],
        "user": {
          "userId": "user-uuid-here",
          "email": "john.doe@example.com"
        }
      }
    }
  ],
  "statistics": {
    "total": 12,
    "pending": 8,
    "approved": 3,
    "rejected": 1
  }
}
```

**Error Responses:**

```json
// Not campaign owner
{
  "success": false,
  "message": "You do not have permission to view applications for this campaign"
}
```

---

### 5. Approve Application

Approve a driver's application to a campaign.

**Endpoint:** `PATCH /api/campaigns/:campaignId/applications/:driverId/approve`

**Access:** Private (Advertiser only)

**Prerequisites:**

- Campaign must belong to the advertiser
- Application must exist
- Application status must be 'pending'

**Request:**

```http
PATCH /api/campaigns/550e8400-e29b-41d4-a716-446655440000/applications/driver-uuid-here/approve
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Application approved successfully",
  "data": {
    "driverCampaignId": "123e4567-e89b-12d3-a456-426614174000",
    "driverId": "driver-uuid-here",
    "campaignId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "approved",
    "matchScore": "85.00",
    "appliedAt": "2025-11-06T10:30:00.000Z",
    "approvedAt": "2025-11-06T14:20:00.000Z",
    "campaign": {
      "campaignId": "550e8400-e29b-41d4-a716-446655440000",
      "campaignName": "Summer Promo 2025",
      "status": "active"
    },
    "driver": {
      "driverId": "driver-uuid-here",
      "firstName": "John",
      "lastName": "Doe",
      "vehicles": [
        {
          "vehicleId": "vehicle-uuid-here",
          "make": "Toyota",
          "model": "Camry",
          "isVerified": true
        }
      ],
      "user": {
        "userId": "user-uuid-here",
        "email": "john.doe@example.com"
      }
    }
  }
}
```

**Error Responses:**

```json
// Application not found
{
  "success": false,
  "message": "Application not found"
}

// Cannot approve non-pending application
{
  "success": false,
  "message": "Cannot approve application with status: rejected"
}

// Not campaign owner
{
  "success": false,
  "message": "You do not have permission to manage applications for this campaign"
}
```

---

### 6. Reject Application

Reject a driver's application with an optional reason.

**Endpoint:** `PATCH /api/campaigns/:campaignId/applications/:driverId/reject`

**Access:** Private (Advertiser only)

**Prerequisites:**

- Campaign must belong to the advertiser
- Application must exist
- Application status must be 'pending'

**Request:**

```http
PATCH /api/campaigns/550e8400-e29b-41d4-a716-446655440000/applications/driver-uuid-here/reject
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "reason": "Vehicle type does not match campaign requirements. We need larger vehicles for this campaign."
}
```

**Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Application rejected",
  "data": {
    "driverCampaignId": "123e4567-e89b-12d3-a456-426614174000",
    "driverId": "driver-uuid-here",
    "campaignId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "rejected",
    "matchScore": "85.00",
    "appliedAt": "2025-11-06T10:30:00.000Z",
    "rejectionReason": "Vehicle type does not match campaign requirements. We need larger vehicles for this campaign.",
    "campaign": {
      "campaignId": "550e8400-e29b-41d4-a716-446655440000",
      "campaignName": "Summer Promo 2025",
      "status": "active"
    },
    "driver": {
      "driverId": "driver-uuid-here",
      "firstName": "John",
      "lastName": "Doe",
      "vehicles": [
        {
          "vehicleId": "vehicle-uuid-here",
          "make": "Toyota",
          "model": "Camry"
        }
      ],
      "user": {
        "userId": "user-uuid-here",
        "email": "john.doe@example.com"
      }
    }
  }
}
```

**Validation Rules:**

- `reason` (optional): String, 10-500 characters

**Error Responses:**

```json
// Invalid reason length
{
  "errors": [
    {
      "msg": "Rejection reason must be between 10 and 500 characters",
      "param": "reason",
      "location": "body"
    }
  ]
}

// Cannot reject non-pending application
{
  "success": false,
  "message": "Cannot reject application with status: approved"
}
```

---

## Testing Workflow

### Complete End-to-End Test

Follow this workflow to test the entire application system:

#### 1. Setup (Prerequisites)

```bash
# 1. Create driver account and profile
POST /api/auth/register
{
  "email": "driver@test.com",
  "password": "Test123!@#",
  "userType": "driver",
  "firstName": "John",
  "lastName": "Doe"
}

# 2. Create and verify vehicle
POST /api/vehicles
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "registrationNumber": "ABC123"
}

# 3. Create advertiser account
POST /api/auth/register
{
  "email": "advertiser@test.com",
  "password": "Test123!@#",
  "userType": "advertiser",
  "companyName": "ABC Marketing"
}

# 4. Create and activate campaign
POST /api/campaigns
{
  "campaignName": "Summer Promo 2025",
  "startDate": "2025-06-01",
  "endDate": "2025-08-31",
  "paymentPerDay": 150
}

PATCH /api/campaigns/:campaignId/status
{
  "status": "active"
}
```

#### 2. Driver Application Flow

```bash
# Step 1: Driver views available campaigns
GET /api/campaigns

# Step 2: Driver applies to campaign
POST /api/campaigns/:campaignId/apply

# Step 3: Driver checks application status
GET /api/campaigns/applications/my

# Step 4: (Optional) Driver cancels application
DELETE /api/campaigns/:campaignId/apply
```

#### 3. Advertiser Management Flow

```bash
# Step 1: Advertiser views applications
GET /api/campaigns/:campaignId/applications

# Step 2: Advertiser views filtered applications (pending only)
GET /api/campaigns/:campaignId/applications?status=pending

# Step 3: Advertiser approves application
PATCH /api/campaigns/:campaignId/applications/:driverId/approve

# OR: Advertiser rejects application
PATCH /api/campaigns/:campaignId/applications/:driverId/reject
{
  "reason": "Vehicle not suitable for campaign requirements"
}
```

#### 4. Status Verification

```bash
# Driver checks updated status
GET /api/campaigns/applications/my

# Advertiser views campaign with updated applications count
GET /api/campaigns/my
```

---

## Error Responses

### Common Error Codes

| Status Code | Meaning               | Common Causes                               |
| ----------- | --------------------- | ------------------------------------------- |
| 400         | Bad Request           | Validation error, business logic constraint |
| 401         | Unauthorized          | Missing or invalid token                    |
| 403         | Forbidden             | Insufficient permissions (wrong user type)  |
| 404         | Not Found             | Resource doesn't exist                      |
| 500         | Internal Server Error | Server-side error                           |

### Validation Errors

Validation errors return a 400 status with detailed field errors:

```json
{
  "errors": [
    {
      "msg": "Invalid campaign ID",
      "param": "campaignId",
      "location": "params"
    }
  ]
}
```

---

## Application Status Flow

```
pending → approved → active → completed
   ↓
rejected
```

**Status Definitions:**

- `pending`: Application submitted, awaiting advertiser review
- `approved`: Advertiser approved, driver can start campaign
- `active`: Driver actively participating in campaign
- `completed`: Campaign finished successfully
- `rejected`: Application rejected by advertiser

---

## PowerShell Testing Examples

```powershell
# Set variables
$API_URL = "http://localhost:3000/api"
$DRIVER_TOKEN = "your-driver-jwt-token"
$ADVERTISER_TOKEN = "your-advertiser-jwt-token"
$CAMPAIGN_ID = "550e8400-e29b-41d4-a716-446655440000"
$DRIVER_ID = "driver-uuid-here"

# Driver: Apply to campaign
Invoke-RestMethod -Uri "$API_URL/campaigns/$CAMPAIGN_ID/apply" `
  -Method POST `
  -Headers @{ "Authorization" = "Bearer $DRIVER_TOKEN" } `
  -ContentType "application/json"

# Driver: Get my applications
Invoke-RestMethod -Uri "$API_URL/campaigns/applications/my" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $DRIVER_TOKEN" }

# Advertiser: Get campaign applications
Invoke-RestMethod -Uri "$API_URL/campaigns/$CAMPAIGN_ID/applications" `
  -Method GET `
  -Headers @{ "Authorization" = "Bearer $ADVERTISER_TOKEN" }

# Advertiser: Approve application
Invoke-RestMethod -Uri "$API_URL/campaigns/$CAMPAIGN_ID/applications/$DRIVER_ID/approve" `
  -Method PATCH `
  -Headers @{ "Authorization" = "Bearer $ADVERTISER_TOKEN" } `
  -ContentType "application/json"

# Advertiser: Reject application with reason
$rejectBody = @{
  reason = "Vehicle does not meet campaign requirements"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$API_URL/campaigns/$CAMPAIGN_ID/applications/$DRIVER_ID/reject" `
  -Method PATCH `
  -Headers @{ "Authorization" = "Bearer $ADVERTISER_TOKEN" } `
  -ContentType "application/json" `
  -Body $rejectBody
```

---

## Tips for Testing

1. **Test in Order**: Follow the workflow from driver application → advertiser review
2. **Use Postman Collections**: Save requests for quick re-testing
3. **Check Statistics**: Verify the statistics object returns correct counts
4. **Test Edge Cases**:
   - Apply to inactive campaign
   - Apply without verified vehicle
   - Approve already rejected application
   - Cancel approved application
5. **Verify Matching Score**: Check that higher-rated drivers get better scores

---

## Next Steps

After successful testing of the Application System:

1. ✅ Campaign CRUD operations
2. ✅ Driver Application System
3. 🔄 **Next**: Target Area Management (PostGIS polygons)
4. ⏳ Location Tracking System
5. ⏳ Analytics Dashboard

---

_Last Updated: November 6, 2025_
