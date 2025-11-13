# Driver Verification API

## Overview

Drivers must be verified by admins before they can apply to campaigns. This is separate from vehicle verification and checks the driver's identity, license, and background.

## Verification Requirements

For a driver to apply to campaigns, they need:

1. ✅ **Driver Profile Created**
2. ✅ **Driver Verified** (by admin)
3. ✅ **At least one Vehicle Registered**
4. ✅ **At least one Vehicle Verified** (by admin)

## Admin Endpoints

### 1. Verify Driver

**Endpoint**: `PATCH /api/drivers/:driverId/verify`

**Authorization**: Admin only

**Description**: Verify a driver's profile (identity, license, background check)

**Request**:

```bash
curl -X PATCH http://localhost:3000/api/drivers/{driverId}/verify \
  -H "Authorization: Bearer <admin_token>"
```

**PowerShell**:

```powershell
$headers = @{
    Authorization = "Bearer $adminToken"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/drivers/$driverId/verify" `
    -Method PATCH `
    -Headers $headers
```

**Response** (200 OK):

```json
{
  "status": "success",
  "message": "Driver verified successfully",
  "data": {
    "driver": {
      "driverId": "uuid",
      "userId": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+1234567890",
      "driversLicenseNumber": "DL123456",
      "city": "New York",
      "region": "NY",
      "averageRating": 0.00,
      "totalCampaignsCompleted": 0,
      "isVerified": true,
      "createdAt": "2024-11-13T00:00:00.000Z",
      "updatedAt": "2024-11-13T00:00:00.000Z",
      "user": {
        "userId": "uuid",
        "email": "driver@example.com",
        "userType": "driver",
        "isActive": true
      },
      "vehicles": [...]
    }
  }
}
```

### 2. Unverify Driver

**Endpoint**: `PATCH /api/drivers/:driverId/unverify`

**Authorization**: Admin only

**Description**: Revoke driver verification (e.g., expired license, policy violation)

**Request**:

```bash
curl -X PATCH http://localhost:3000/api/drivers/{driverId}/unverify \
  -H "Authorization: Bearer <admin_token>"
```

**Response** (200 OK):

```json
{
  "status": "success",
  "message": "Driver verification revoked successfully",
  "data": {
    "driver": {
      "driverId": "uuid",
      "isVerified": false,
      ...
    }
  }
}
```

## Impact on Applications

### Before Driver Verification

- ❌ Cannot apply to campaigns
- ❌ Returns error: "Your driver profile must be verified before applying to campaigns"

### After Driver Verification

- ✅ Can apply to campaigns (if vehicle is also verified)
- ✅ Higher matching score (25 bonus points)

## Matching Score Algorithm (Updated)

**Total**: 100 points maximum

| Component            | Points | Description                              |
| -------------------- | ------ | ---------------------------------------- |
| **Driver Verified**  | 25     | Driver identity/license verified         |
| **Vehicle Verified** | 25     | At least one vehicle verified            |
| **Driver Rating**    | 30     | Based on 0-5 star rating                 |
| **Experience**       | 20     | Completed campaigns (10 for new drivers) |

### Examples:

**New Driver (Not Verified)**:

- Driver Verified: 0 points ❌
- Vehicle Verified: 0 points ❌
- Rating: 15 points (default for new)
- Experience: 10 points (new driver)
- **Total: 25/100** ⚠️ Cannot apply

**New Driver (Verified)**:

- Driver Verified: 25 points ✅
- Vehicle Verified: 25 points ✅
- Rating: 15 points (default)
- Experience: 10 points (new)
- **Total: 75/100** ✅ Can apply

**Experienced Driver (Verified)**:

- Driver Verified: 25 points ✅
- Vehicle Verified: 25 points ✅
- Rating: 24 points (4.0 stars)
- Experience: 20 points (completed campaigns)
- **Total: 94/100** ⭐ Excellent match

## Complete Workflow

### 1. Driver Registration & Profile Setup

```bash
# Register as driver
POST /api/auth/register
{
  "email": "driver@example.com",
  "password": "password123",
  "userType": "driver"
}

# Create driver profile
POST /api/drivers
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "driversLicenseNumber": "DL123456",
  "city": "New York",
  "region": "NY"
}

# Add vehicle
POST /api/vehicles
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "registrationNumber": "ABC123",
  "vehicleType": "sedan"
}
```

### 2. Admin Verification (Sequential)

```bash
# Admin verifies driver
PATCH /api/drivers/{driverId}/verify

# Admin verifies vehicle
PATCH /api/vehicles/{vehicleId}/verify
```

### 3. Driver Can Apply

```bash
# Driver applies to campaign
POST /api/campaigns/{campaignId}/apply
{
  "coverageLetter": "I'm interested in this campaign..."
}
```

## Testing in Postman

### Test 1: Verify Driver Works (Admin)

**Setup**:

1. Login as admin → Save `admin_token`
2. Create driver account
3. Create driver profile → Save `driver_id`

**Test**:

```
PATCH {{base_url}}/api/drivers/{{driver_id}}/verify
Headers: Authorization: Bearer {{admin_token}}
```

**Expected**: 200 OK, `isVerified: true`

**Postman Test Script**:

```javascript
pm.test("Status is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Driver is verified", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data.driver.isVerified).to.be.true;
});
```

### Test 2: Unverified Driver Cannot Apply

**Setup**:

1. Create driver (not verified)
2. Create vehicle
3. Admin verifies vehicle
4. Try to apply to campaign

**Test**:

```
POST {{base_url}}/api/campaigns/{{campaign_id}}/apply
Headers: Authorization: Bearer {{driver_token}}
Body: {
  "coverageLetter": "I want to join this campaign"
}
```

**Expected**: 400 Bad Request

```json
{
  "success": false,
  "message": "Your driver profile must be verified before applying to campaigns. Please contact support."
}
```

### Test 3: Non-Admin Cannot Verify Driver

**Test**:

```
PATCH {{base_url}}/api/drivers/{{driver_id}}/verify
Headers: Authorization: Bearer {{driver_token}}
```

**Expected**: 403 Forbidden

```json
{
  "status": "error",
  "message": "Forbidden: Requires admin role"
}
```

### Test 4: Complete Flow with Both Verifications

**Steps**:

1. ✅ Register driver
2. ✅ Create driver profile
3. ✅ Add vehicle
4. ✅ Admin verifies driver
5. ✅ Admin verifies vehicle
6. ✅ Driver applies to campaign
7. ✅ Check matching score includes both bonuses

**Expected Matching Score**: Minimum 75/100 (25 driver + 25 vehicle + 15 rating + 10 experience)

## Error Responses

### Driver Not Found (404)

```json
{
  "status": "error",
  "message": "Driver not found"
}
```

### Not Authorized (403)

```json
{
  "status": "error",
  "message": "Forbidden: Requires admin role"
}
```

### Driver Not Verified (400)

```json
{
  "success": false,
  "message": "Your driver profile must be verified before applying to campaigns. Please contact support."
}
```

## FAQ

### Q: What gets verified for a driver?

A: Driver verification checks:

- Driver's license validity
- Identity documents
- Background check
- Driving record

### Q: Can a driver verify themselves?

A: No, only admins can verify drivers (prevents fraud).

### Q: What happens if driver verification is revoked?

A:

- Existing applications remain valid
- Cannot apply to new campaigns
- Active campaigns continue (unless manually removed)
- Matching score drops by 25 points

### Q: Is driver verification permanent?

A: Admins can revoke at any time (expired license, violations, etc.)

### Q: Can I apply with only driver OR vehicle verified?

A: No, BOTH must be verified:

- ❌ Driver verified only → Cannot apply (no verified vehicle)
- ❌ Vehicle verified only → Cannot apply (driver not verified)
- ✅ Both verified → Can apply

### Q: Does driver verification affect all their vehicles?

A: No, they are separate:

- Driver verification = Identity/license check
- Vehicle verification = Per-vehicle condition/registration check

## Summary

**Two-Level Verification System**:

1. **Driver Level**: Verifies the person (identity, license, background)
2. **Vehicle Level**: Verifies each vehicle separately (registration, condition, photos)

**Both are required** for a driver to participate in campaigns.

**Admin Controls**:

- `PATCH /api/drivers/:id/verify` - Verify driver
- `PATCH /api/drivers/:id/unverify` - Revoke driver verification
- `PATCH /api/vehicles/:id/verify` - Verify vehicle
- `PATCH /api/vehicles/:id/unverify` - Revoke vehicle verification

This provides granular control and security for the platform! 🔐
