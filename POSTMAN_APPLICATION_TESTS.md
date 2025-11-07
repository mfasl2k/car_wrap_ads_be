# Postman Tests for Application API

This document contains ready-to-use Postman requests for testing the Driver Application System.

## 📋 Prerequisites Setup

### Step 1: Environment Variables (Create in Postman)

Create a Postman Environment with these variables:

```
base_url: http://localhost:5000/api
driver_token: (will be set after driver login)
advertiser_token: (will be set after advertiser login)
campaign_id: (will be set after campaign creation)
driver_id: (will be set after driver profile creation)
```

---

## 🔧 SETUP: Create Test Users and Data

### 1. Register Driver

```
POST {{base_url}}/auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "email": "testdriver@example.com",
  "password": "Driver123!@#",
  "userType": "driver",
  "firstName": "John",
  "lastName": "Driver"
}
```

**Expected Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "...",
    "email": "testdriver@example.com",
    "userType": "driver"
  }
}
```

**Postman Test Script:**
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("driver_token", jsonData.token);
    pm.environment.set("driver_user_id", jsonData.user.userId);
    console.log("✅ Driver token saved");
}
```

---

### 2. Create Driver Profile

```
POST {{base_url}}/drivers
Authorization: Bearer {{driver_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Driver",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-15",
  "driversLicenseNumber": "DL123456789",
  "city": "Los Angeles",
  "region": "California"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Driver profile created successfully",
  "data": {
    "driverId": "...",
    "firstName": "John",
    "lastName": "Driver"
  }
}
```

**Postman Test Script:**
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("driver_id", jsonData.data.driverId);
    console.log("✅ Driver ID saved:", jsonData.data.driverId);
}
```

---

### 3. Register Vehicle

```
POST {{base_url}}/vehicles
Authorization: Bearer {{driver_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "color": "Silver",
  "registrationNumber": "ABC123",
  "vehicleType": "sedan",
  "sizeCategory": "medium"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Vehicle registered successfully",
  "data": {
    "vehicleId": "...",
    "make": "Toyota",
    "model": "Camry",
    "isVerified": false
  }
}
```

**Postman Test Script:**
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("vehicle_id", jsonData.data.vehicleId);
    console.log("✅ Vehicle ID saved:", jsonData.data.vehicleId);
}
```

---

### 4. Create Admin Account

**Admin users can verify vehicles**

```
POST {{base_url}}/auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@carwrapad.com",
  "password": "Admin123!@#",
  "userType": "admin"
}
```

**Expected Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "userId": "...",
      "email": "admin@carwrapad.com",
      "userType": "admin",
      "isActive": true,
      "isVerified": true,
      "createdAt": "2025-11-07T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Postman Test Script:**
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("admin_token", jsonData.data.token);
    pm.environment.set("admin_user_id", jsonData.data.user.userId);
    console.log("✅ Admin token saved");
}
```

---

### 5. Verify Vehicle (Admin) ⭐

**Admins verify vehicles before drivers can apply to campaigns**

```
PATCH {{base_url}}/vehicles/{{vehicle_id}}/verify
Authorization: Bearer {{admin_token}}
```

**No Body Required**

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Vehicle verified successfully",
  "data": {
    "vehicle": {
      "vehicleId": "...",
      "driverId": "...",
      "make": "Toyota",
      "model": "Camry",
      "year": 2020,
      "color": "Silver",
      "registrationNumber": "ABC123",
      "vehicleType": "sedan",
      "sizeCategory": "medium",
      "photoUrl": null,
      "isVerified": true,
      "createdAt": "2025-11-07T09:05:00.000Z",
      "driver": {
        "driverId": "...",
        "firstName": "John",
        "lastName": "Driver",
        "user": {
          "userId": "...",
          "email": "testdriver@example.com"
        }
      }
    }
  }
}
```

**Postman Test Script:**
```javascript
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Vehicle is verified", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.vehicle.isVerified).to.be.true;
    console.log("✅ Vehicle verified:", jsonData.data.vehicle.make, jsonData.data.vehicle.model);
});
```

**Alternative: Manual Database Update**

If you prefer, you can still verify vehicles directly in the database:

```sql
UPDATE vehicle 
SET is_verified = true 
WHERE registration_number = 'ABC123';
```

---

### 6. Register Advertiser

```
POST {{base_url}}/auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "email": "testadvertiser@example.com",
  "password": "Advertiser123!@#",
  "userType": "advertiser",
  "companyName": "Test Marketing Ltd"
}
```

**Expected Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "userId": "...",
      "email": "testadvertiser@example.com",
      "userType": "advertiser"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Postman Test Script:**
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("advertiser_token", jsonData.data.token);
    pm.environment.set("advertiser_user_id", jsonData.data.user.userId);
    console.log("✅ Advertiser token saved");
}
```

---

### 7. Create Advertiser Profile

```
POST {{base_url}}/advertisers
Authorization: Bearer {{advertiser_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "companyName": "Test Marketing Ltd",
  "contactPerson": "Jane Advertiser",
  "phoneNumber": "+1987654321",
  "businessAddress": "123 Business St, Los Angeles, CA",
  "city": "Los Angeles",
  "industry": "Marketing"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Advertiser profile created successfully",
  "data": {
    "advertiserId": "...",
    "companyName": "Test Marketing Ltd"
  }
}
```

**Postman Test Script:**
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("advertiser_id", jsonData.data.advertiserId);
    console.log("✅ Advertiser ID saved");
}
```

---

### 8. Create Campaign

```
POST {{base_url}}/campaigns
Authorization: Bearer {{advertiser_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "campaignName": "Summer Sale Campaign 2025",
  "description": "Promote our summer products across Los Angeles",
  "startDate": "2025-06-01",
  "endDate": "2025-08-31",
  "paymentPerDay": 150,
  "requiredDrivers": 5
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Campaign created successfully",
  "data": {
    "campaignId": "...",
    "campaignName": "Summer Sale Campaign 2025",
    "status": "draft"
  }
}
```

**Postman Test Script:**
```javascript
if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("campaign_id", jsonData.data.campaignId);
    console.log("✅ Campaign ID saved:", jsonData.data.campaignId);
}
```

---

### 9. Activate Campaign

```
PATCH {{base_url}}/campaigns/{{campaign_id}}/status
Authorization: Bearer {{advertiser_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "status": "active"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Campaign status updated successfully",
  "data": {
    "campaignId": "...",
    "status": "active"
  }
}
```

---

## 🚗 DRIVER SIDE TESTS

### Test 1: View Available Campaigns (Driver)

```
GET {{base_url}}/campaigns
Authorization: Bearer {{driver_token}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "campaignId": "...",
        "campaignName": "Summer Sale Campaign 2025",
        "description": "Promote our summer products across Los Angeles",
        "status": "active",
        "startDate": "2025-06-01T00:00:00.000Z",
        "endDate": "2025-08-31T00:00:00.000Z",
        "paymentPerDay": "150.00",
        "requiredDrivers": 5,
        "advertiser": {
          "advertiserId": "...",
          "companyName": "Test Marketing Ltd"
        },
        "_count": {
          "driverCampaigns": 0
        }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

**Postman Test Script:**
```javascript
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has campaigns array", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.campaigns).to.be.an('array');
});
```

---

### Test 2: Apply to Campaign (Driver) ⭐

```
POST {{base_url}}/campaigns/{{campaign_id}}/apply
Authorization: Bearer {{driver_token}}
```

**No Body Required**

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "driverCampaignId": "...",
    "driverId": "...",
    "campaignId": "...",
    "status": "pending",
    "matchScore": "85.00",
    "startDate": null,
    "endDate": null,
    "appliedAt": "2025-11-07T10:30:00.000Z",
    "approvedAt": null,
    "rejectionReason": null,
    "createdAt": "2025-11-07T10:30:00.000Z",
    "campaign": {
      "campaignId": "...",
      "advertiserId": "...",
      "campaignName": "Summer Sale Campaign 2025",
      "description": "Promote our summer products across Los Angeles",
      "status": "active",
      "startDate": "2025-06-01T00:00:00.000Z",
      "endDate": "2025-08-31T00:00:00.000Z",
      "paymentPerDay": "150.00",
      "requiredDrivers": 5,
      "wrapDesignUrl": null,
      "createdAt": "2025-11-07T10:00:00.000Z",
      "updatedAt": "2025-11-07T10:00:00.000Z",
      "advertiser": {
        "advertiserId": "...",
        "companyName": "Test Marketing Ltd"
      }
    },
    "driver": {
      "driverId": "...",
      "userId": "...",
      "driversLicenseNumber": "DL123456789",
      "firstName": "John",
      "lastName": "Driver",
      "phoneNumber": "+1234567890",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "city": "Los Angeles",
      "region": "California",
      "averageRating": "0.00",
      "totalCampaignsCompleted": 0,
      "isVerified": false,
      "createdAt": "2025-11-07T09:00:00.000Z",
      "updatedAt": "2025-11-07T09:00:00.000Z",
      "vehicles": [
        {
          "vehicleId": "...",
          "driverId": "...",
          "make": "Toyota",
          "model": "Camry",
          "year": 2020,
          "color": "Silver",
          "registrationNumber": "ABC123",
          "vehicleType": "sedan",
          "sizeCategory": "medium",
          "photoUrl": null,
          "isVerified": true,
          "createdAt": "2025-11-07T09:05:00.000Z"
        }
      ]
    }
  }
}
```

**Postman Test Script:**
```javascript
pm.test("Status is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Application status is pending", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.status).to.equal("pending");
});

pm.test("Match score is calculated", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.matchScore).to.exist;
    console.log("Match Score:", jsonData.data.matchScore);
});

if (pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("application_id", jsonData.data.driverCampaignId);
    console.log("✅ Application submitted with score:", jsonData.data.matchScore);
}
```

---

### Test 3: Try to Apply Again (Should Fail)

```
POST {{base_url}}/campaigns/{{campaign_id}}/apply
Authorization: Bearer {{driver_token}}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "You have already applied to this campaign. Current status: pending"
}
```

**Postman Test Script:**
```javascript
pm.test("Status is 400", function () {
    pm.response.to.have.status(400);
});

pm.test("Error message about duplicate application", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.message).to.include("already applied");
});
```

---

### Test 4: Get My Applications (Driver)

```
GET {{base_url}}/campaigns/applications/my
Authorization: Bearer {{driver_token}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "driverCampaignId": "...",
      "driverId": "...",
      "campaignId": "...",
      "status": "pending",
      "matchScore": "85.00",
      "startDate": null,
      "endDate": null,
      "appliedAt": "2025-11-07T10:30:00.000Z",
      "approvedAt": null,
      "rejectionReason": null,
      "createdAt": "2025-11-07T10:30:00.000Z",
      "campaign": {
        "campaignId": "...",
        "advertiserId": "...",
        "campaignName": "Summer Sale Campaign 2025",
        "description": "Promote our summer products across Los Angeles",
        "status": "active",
        "startDate": "2025-06-01T00:00:00.000Z",
        "endDate": "2025-08-31T00:00:00.000Z",
        "paymentPerDay": "150.00",
        "requiredDrivers": 5,
        "wrapDesignUrl": null,
        "createdAt": "2025-11-07T10:00:00.000Z",
        "updatedAt": "2025-11-07T10:00:00.000Z",
        "advertiser": {
          "advertiserId": "...",
          "companyName": "Test Marketing Ltd"
        }
      }
    }
  ],
  "statistics": {
    "total": 1,
    "pending": 1,
    "approved": 0,
    "rejected": 0
  }
}
```

**Postman Test Script:**
```javascript
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Has applications array", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.be.an('array');
});

pm.test("Has statistics", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.statistics).to.exist;
    console.log("Statistics:", JSON.stringify(jsonData.statistics, null, 2));
});
```

---

### Test 5: Filter Applications by Status (Driver)

```
GET {{base_url}}/campaigns/applications/my?status=pending
Authorization: Bearer {{driver_token}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "status": "pending",
      "campaign": {
        "campaignName": "Summer Sale Campaign 2025"
      }
    }
  ],
  "statistics": {
    "total": 1,
    "pending": 1,
    "approved": 0,
    "rejected": 0
  }
}
```

**Postman Test Script:**
```javascript
pm.test("All applications are pending", function () {
    const jsonData = pm.response.json();
    jsonData.data.forEach(app => {
        pm.expect(app.status).to.equal("pending");
    });
});
```

---

## 🏢 ADVERTISER SIDE TESTS

### Test 6: View Campaign Applications (Advertiser)

```
GET {{base_url}}/campaigns/{{campaign_id}}/applications
Authorization: Bearer {{advertiser_token}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "driverCampaignId": "...",
      "driverId": "...",
      "campaignId": "...",
      "status": "pending",
      "matchScore": "85.00",
      "startDate": null,
      "endDate": null,
      "appliedAt": "2025-11-07T10:30:00.000Z",
      "approvedAt": null,
      "rejectionReason": null,
      "createdAt": "2025-11-07T10:30:00.000Z",
      "driver": {
        "driverId": "...",
        "userId": "...",
        "driversLicenseNumber": "DL123456789",
        "firstName": "John",
        "lastName": "Driver",
        "phoneNumber": "+1234567890",
        "dateOfBirth": "1990-01-15T00:00:00.000Z",
        "city": "Los Angeles",
        "region": "California",
        "averageRating": "0.00",
        "totalCampaignsCompleted": 0,
        "isVerified": false,
        "createdAt": "2025-11-07T09:00:00.000Z",
        "updatedAt": "2025-11-07T09:00:00.000Z",
        "vehicles": [
          {
            "vehicleId": "...",
            "make": "Toyota",
            "model": "Camry",
            "year": 2020,
            "isVerified": true
          }
        ],
        "user": {
          "userId": "...",
          "email": "testdriver@example.com"
        }
      }
    }
  ],
  "statistics": {
    "total": 1,
    "pending": 1,
    "approved": 0,
    "rejected": 0
  }
}
```

**Postman Test Script:**
```javascript
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Has driver details", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data[0].driver).to.exist;
    pm.expect(jsonData.data[0].driver.vehicles).to.be.an('array');
    console.log("Driver:", jsonData.data[0].driver.firstName, jsonData.data[0].driver.lastName);
    console.log("Match Score:", jsonData.data[0].matchScore);
});
```

---

### Test 7: Filter Applications by Status (Advertiser)

```
GET {{base_url}}/campaigns/{{campaign_id}}/applications?status=pending
Authorization: Bearer {{advertiser_token}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "status": "pending",
      "driver": {
        "firstName": "John",
        "lastName": "Driver"
      }
    }
  ],
  "statistics": {
    "total": 1,
    "pending": 1,
    "approved": 0,
    "rejected": 0
  }
}
```

---

### Test 8: Approve Application (Advertiser) ⭐

```
PATCH {{base_url}}/campaigns/{{campaign_id}}/applications/{{driver_id}}/approve
Authorization: Bearer {{advertiser_token}}
```

**No Body Required**

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Application approved successfully",
  "data": {
    "driverCampaignId": "...",
    "driverId": "...",
    "campaignId": "...",
    "status": "approved",
    "matchScore": "85.00",
    "startDate": null,
    "endDate": null,
    "appliedAt": "2025-11-07T10:30:00.000Z",
    "approvedAt": "2025-11-07T11:00:00.000Z",
    "rejectionReason": null,
    "createdAt": "2025-11-07T10:30:00.000Z",
    "campaign": {
      "campaignId": "...",
      "campaignName": "Summer Sale Campaign 2025",
      "status": "active"
    },
    "driver": {
      "driverId": "...",
      "firstName": "John",
      "lastName": "Driver",
      "vehicles": [
        {
          "make": "Toyota",
          "model": "Camry",
          "isVerified": true
        }
      ],
      "user": {
        "userId": "...",
        "email": "testdriver@example.com"
      }
    }
  }
}
```

**Postman Test Script:**
```javascript
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Application is approved", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.status).to.equal("approved");
    pm.expect(jsonData.data.approvedAt).to.exist;
    console.log("✅ Application approved at:", jsonData.data.approvedAt);
});
```

---

### Test 9: Try to Approve Again (Should Fail)

```
PATCH {{base_url}}/campaigns/{{campaign_id}}/applications/{{driver_id}}/approve
Authorization: Bearer {{advertiser_token}}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Cannot approve application with status: approved"
}
```

**Postman Test Script:**
```javascript
pm.test("Status is 400", function () {
    pm.response.to.have.status(400);
});

pm.test("Error about application status", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.message).to.include("Cannot approve");
});
```

---

### Test 10: Create Second Driver for Rejection Test

Repeat Steps 1-4 with:
- Email: `testdriver2@example.com`
- Registration: `XYZ789`
- Then apply to campaign

After this driver applies, proceed with rejection test below.

---

### Test 11: Reject Application (Advertiser) ⭐

```
PATCH {{base_url}}/campaigns/{{campaign_id}}/applications/{{driver_id}}/reject
Authorization: Bearer {{advertiser_token}}
Content-Type: application/json
```

**Body:**
```json
{
  "reason": "Unfortunately, your vehicle type does not match the campaign requirements at this time."
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Application rejected",
  "data": {
    "driverCampaignId": "...",
    "driverId": "...",
    "campaignId": "...",
    "status": "rejected",
    "matchScore": "85.00",
    "appliedAt": "2025-11-07T10:30:00.000Z",
    "approvedAt": null,
    "rejectionReason": "Unfortunately, your vehicle type does not match the campaign requirements at this time.",
    "createdAt": "2025-11-07T10:30:00.000Z",
    "campaign": {
      "campaignId": "...",
      "campaignName": "Summer Sale Campaign 2025",
      "status": "active"
    },
    "driver": {
      "firstName": "John",
      "lastName": "Driver"
    }
  }
}
```

**Postman Test Script:**
```javascript
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Application is rejected", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.status).to.equal("rejected");
    pm.expect(jsonData.data.rejectionReason).to.exist;
    console.log("❌ Rejection reason:", jsonData.data.rejectionReason);
});
```

---

### Test 12: Reject Without Reason (Optional Reason)

```
PATCH {{base_url}}/campaigns/{{campaign_id}}/applications/{{driver_id}}/reject
Authorization: Bearer {{advertiser_token}}
Content-Type: application/json
```

**Body:**
```json
{}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Application rejected",
  "data": {
    "status": "rejected",
    "rejectionReason": null
  }
}
```

---

## 🚫 DRIVER CANCELLATION TESTS

### Test 13: Cancel Pending Application (Driver)

**First, create a new application that's still pending**

```
DELETE {{base_url}}/campaigns/{{campaign_id}}/apply
Authorization: Bearer {{driver_token}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Application cancelled successfully"
}
```

**Postman Test Script:**
```javascript
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Success message", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.message).to.include("cancelled successfully");
});
```

---

### Test 14: Try to Cancel Approved Application (Should Fail)

```
DELETE {{base_url}}/campaigns/{{campaign_id}}/apply
Authorization: Bearer {{driver_token}}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Cannot cancel application with status: approved"
}
```

**Postman Test Script:**
```javascript
pm.test("Status is 400", function () {
    pm.response.to.have.status(400);
});
```

---

## ❌ ERROR/VALIDATION TESTS

### Test 15: Apply Without Vehicle

**Delete driver's vehicle first or create new driver without vehicle**

```
POST {{base_url}}/campaigns/{{campaign_id}}/apply
Authorization: Bearer {{driver_token}}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "You must have a registered vehicle to apply to campaigns."
}
```

---

### Test 16: Apply to Draft Campaign

**Create a new campaign but don't activate it**

```
POST {{base_url}}/campaigns/{{draft_campaign_id}}/apply
Authorization: Bearer {{driver_token}}
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Cannot apply to draft campaign. Campaign must be active."
}
```

---

### Test 17: Invalid Campaign ID

```
POST {{base_url}}/campaigns/invalid-uuid-here/apply
Authorization: Bearer {{driver_token}}
```

**Expected Response (400):**
```json
{
  "errors": [
    {
      "msg": "Invalid campaign ID",
      "param": "id",
      "location": "params"
    }
  ]
}
```

---

### Test 18: Wrong User Type (Driver tries advertiser endpoint)

```
GET {{base_url}}/campaigns/{{campaign_id}}/applications
Authorization: Bearer {{driver_token}}
```

**Expected Response (403):**
```json
{
  "message": "You do not have permission to perform this action"
}
```

---

### Test 19: Wrong User Type (Advertiser tries driver endpoint)

```
POST {{base_url}}/campaigns/{{campaign_id}}/apply
Authorization: Bearer {{advertiser_token}}
```

**Expected Response (403):**
```json
{
  "message": "You do not have permission to perform this action"
}
```

---

### Test 20: Advertiser Tries to View Another Advertiser's Applications

**Create second advertiser and try to view first advertiser's campaign applications**

```
GET {{base_url}}/campaigns/{{campaign_id}}/applications
Authorization: Bearer {{other_advertiser_token}}
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "You do not have permission to view applications for this campaign"
}
```

---

## 📊 STATISTICS VERIFICATION TESTS

### Test 21: Verify Statistics After Multiple Applications

**Create 5 drivers, have them all apply to same campaign:**
- Approve 2 applications
- Reject 2 applications
- Leave 1 pending

Then check statistics:

```
GET {{base_url}}/campaigns/{{campaign_id}}/applications
Authorization: Bearer {{advertiser_token}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [...],
  "statistics": {
    "total": 5,
    "pending": 1,
    "approved": 2,
    "rejected": 2
  }
}
```

**Postman Test Script:**
```javascript
pm.test("Statistics match expected counts", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.statistics.total).to.equal(5);
    pm.expect(jsonData.statistics.approved).to.equal(2);
    pm.expect(jsonData.statistics.rejected).to.equal(2);
    pm.expect(jsonData.statistics.pending).to.equal(1);
});
```

---

## 🎯 MATCHING SCORE TESTS

### Test 22: Check Matching Score Calculation

Create drivers with different ratings and verify match scores:

**High Rating Driver (4.5 stars):**
- Expected score: ~95 (50 + 27 + 20)

**New Driver (0 stars):**
- Expected score: ~85 (50 + 15 + 20)

**Driver without verified vehicle:**
- Expected score: ~65 (50 + 15 + 0)

```
POST {{base_url}}/campaigns/{{campaign_id}}/apply
Authorization: Bearer {{driver_token}}
```

Check `matchScore` in response.

**Postman Test Script:**
```javascript
pm.test("Match score is calculated", function () {
    const jsonData = pm.response.json();
    const score = parseFloat(jsonData.data.matchScore);
    pm.expect(score).to.be.at.least(0);
    pm.expect(score).to.be.at.most(100);
    console.log("Match Score:", score);
});
```

---

## 📝 Test Execution Order

Run tests in this order for complete workflow:

1. **Setup (Tests 1-8)**: Create users, profiles, vehicles, campaigns
2. **Driver Tests (Tests 1-5)**: Driver applies and views applications
3. **Advertiser Tests (Tests 6-12)**: Advertiser views and manages applications
4. **Cancellation Tests (Tests 13-14)**: Driver cancels applications
5. **Error Tests (Tests 15-20)**: Validate error handling
6. **Statistics Tests (Test 21)**: Verify aggregation
7. **Matching Tests (Test 22)**: Verify scoring algorithm

---

## 🔍 Quick Test Checklist

- [ ] Driver can register and create profile
- [ ] Driver can register and verify vehicle
- [ ] Driver can view active campaigns
- [ ] Driver can apply to campaign
- [ ] Driver cannot apply twice to same campaign
- [ ] Driver can view their applications
- [ ] Driver can filter applications by status
- [ ] Driver can cancel pending applications
- [ ] Driver cannot cancel approved applications
- [ ] Advertiser can view campaign applications
- [ ] Advertiser can filter applications by status
- [ ] Advertiser can approve pending applications
- [ ] Advertiser cannot approve non-pending applications
- [ ] Advertiser can reject with reason
- [ ] Advertiser can reject without reason
- [ ] Match score is calculated correctly
- [ ] Statistics are accurate
- [ ] Role-based access is enforced
- [ ] Validation catches invalid UUIDs
- [ ] Cannot apply to draft campaigns

---

## 💡 Tips

1. **Save as Postman Collection**: Organize tests into folders (Setup, Driver, Advertiser, Errors)
2. **Use Pre-request Scripts**: Auto-generate test data
3. **Chain Requests**: Use Test Scripts to save IDs for next requests
4. **Environment Switching**: Create separate environments for development/staging
5. **Newman CLI**: Run tests from command line with `newman run collection.json`

---

*Ready to test! Start with the Setup section and work through each test sequentially.*
