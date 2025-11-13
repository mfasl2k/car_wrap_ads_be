# Advertiser Verification API

## Overview

Advertisers must be verified by admins before they can create campaigns. This ensures business legitimacy and protects drivers from fraudulent campaigns.

## Verification Requirements

For an advertiser to create campaigns, they need:

1. ✅ **Advertiser Profile Created**
2. ✅ **Advertiser Verified** (by admin)

## Admin Endpoints

### 1. Verify Advertiser

**Endpoint**: `PATCH /api/advertisers/:advertiserId/verify`

**Authorization**: Admin only

**Description**: Verify an advertiser's business profile (business registration, legitimacy check)

**Request**:

```bash
curl -X PATCH http://localhost:3000/api/advertisers/{advertiserId}/verify \
  -H "Authorization: Bearer <admin_token>"
```

**PowerShell**:

```powershell
$headers = @{
    Authorization = "Bearer $adminToken"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/advertisers/$advertiserId/verify" `
    -Method PATCH `
    -Headers $headers
```

**Response** (200 OK):

```json
{
  "status": "success",
  "message": "Advertiser verified successfully",
  "data": {
    "advertiser": {
      "advertiserId": "uuid",
      "userId": "uuid",
      "companyName": "Acme Corporation",
      "contactPerson": "John Smith",
      "phoneNumber": "+1234567890",
      "businessAddress": "123 Business St",
      "city": "New York",
      "industry": "Technology",
      "isVerified": true,
      "createdAt": "2024-11-13T00:00:00.000Z",
      "updatedAt": "2024-11-13T00:00:00.000Z",
      "user": {
        "userId": "uuid",
        "email": "advertiser@acme.com",
        "userType": "advertiser",
        "isActive": true
      },
      "campaigns": [...]
    }
  }
}
```

### 2. Unverify Advertiser

**Endpoint**: `PATCH /api/advertisers/:advertiserId/unverify`

**Authorization**: Admin only

**Description**: Revoke advertiser verification (e.g., policy violation, fraud detection)

**Request**:

```bash
curl -X PATCH http://localhost:3000/api/advertisers/{advertiserId}/unverify \
  -H "Authorization: Bearer <admin_token>"
```

**Response** (200 OK):

```json
{
  "status": "success",
  "message": "Advertiser verification revoked successfully",
  "data": {
    "advertiser": {
      "advertiserId": "uuid",
      "isVerified": false,
      ...
    }
  }
}
```

## Impact on Campaigns

### Before Advertiser Verification

- ❌ Cannot create campaigns
- ❌ Returns error: "Your advertiser profile must be verified before creating campaigns. Please contact support."
- ✅ Can still view/manage existing campaigns (created before unverification)

### After Advertiser Verification

- ✅ Can create new campaigns
- ✅ Can manage all campaigns
- ✅ Drivers trust verified advertisers more

## Complete Workflow

### 1. Advertiser Registration & Profile Setup

```bash
# Register as advertiser
POST /api/auth/register
{
  "email": "advertiser@company.com",
  "password": "password123",
  "userType": "advertiser"
}

# Create advertiser profile
POST /api/advertisers
{
  "companyName": "Acme Corporation",
  "contactPerson": "John Smith",
  "phoneNumber": "+1234567890",
  "businessAddress": "123 Business St",
  "city": "New York",
  "industry": "Technology"
}
```

### 2. Admin Verification

```bash
# Admin verifies advertiser
PATCH /api/advertisers/{advertiserId}/verify
```

### 3. Advertiser Can Create Campaigns

```bash
# Advertiser creates campaign
POST /api/campaigns
{
  "campaignName": "Summer Sale Campaign",
  "description": "Promote our summer sale",
  "startDate": "2024-12-01",
  "endDate": "2024-12-31",
  "paymentPerDay": 50,
  "requiredDrivers": 10
}
```

## Testing in Postman

### Test 1: Verify Advertiser Works (Admin)

**Setup**:

1. Login as admin → Save `admin_token`
2. Create advertiser account
3. Create advertiser profile → Save `advertiser_id`

**Test**:

```
PATCH {{base_url}}/api/advertisers/{{advertiser_id}}/verify
Headers: Authorization: Bearer {{admin_token}}
```

**Expected**: 200 OK, `isVerified: true`

**Postman Test Script**:

```javascript
pm.test("Status is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Advertiser is verified", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data.advertiser.isVerified).to.be.true;
});
```

### Test 2: Unverified Advertiser Cannot Create Campaign

**Setup**:

1. Create advertiser (not verified)
2. Try to create campaign

**Test**:

```
POST {{base_url}}/api/campaigns
Headers: Authorization: Bearer {{advertiser_token}}
Body: {
  "campaignName": "Test Campaign",
  "startDate": "2024-12-01",
  "endDate": "2024-12-31",
  "requiredDrivers": 5
}
```

**Expected**: 403 Forbidden

```json
{
  "status": "error",
  "message": "Your advertiser profile must be verified before creating campaigns. Please contact support."
}
```

### Test 3: Non-Admin Cannot Verify Advertiser

**Test**:

```
PATCH {{base_url}}/api/advertisers/{{advertiser_id}}/verify
Headers: Authorization: Bearer {{driver_token}}
```

**Expected**: 403 Forbidden

```json
{
  "status": "error",
  "message": "Forbidden: Requires admin role"
}
```

### Test 4: Verified Advertiser Can Create Campaign

**Steps**:

1. ✅ Register advertiser
2. ✅ Create advertiser profile
3. ✅ Admin verifies advertiser
4. ✅ Advertiser creates campaign

**Expected**: 201 Created with campaign data

## Error Responses

### Advertiser Not Found (404)

```json
{
  "status": "error",
  "message": "Advertiser not found"
}
```

### Not Authorized (403)

```json
{
  "status": "error",
  "message": "Forbidden: Requires admin role"
}
```

### Advertiser Not Verified (403)

```json
{
  "status": "error",
  "message": "Your advertiser profile must be verified before creating campaigns. Please contact support."
}
```

## FAQ

### Q: What gets verified for an advertiser?

A: Advertiser verification checks:

- Business registration documents
- Company legitimacy
- Contact information validity
- Industry compliance

### Q: Can an advertiser verify themselves?

A: No, only admins can verify advertisers (prevents fraud).

### Q: What happens if advertiser verification is revoked?

A:

- Existing campaigns remain active (unless manually paused)
- Cannot create new campaigns
- Drivers can still apply to existing campaigns
- Can still manage applications for existing campaigns

### Q: Is advertiser verification permanent?

A: Admins can revoke at any time (policy violations, fraud, etc.)

### Q: Can I manage campaigns if unverified?

A: Yes, existing campaigns can be managed:

- ✅ View applications
- ✅ Approve/reject drivers
- ✅ Update campaign details
- ❌ Cannot create NEW campaigns

### Q: Do existing campaigns get paused if verification is revoked?

A: No, existing campaigns continue normally. Admin must manually pause/cancel if needed.

## Complete Verification System Summary

### Three Verification Types

| User Type      | Verification                    | Purpose                    | Impact                                         |
| -------------- | ------------------------------- | -------------------------- | ---------------------------------------------- |
| **Driver**     | Admin verifies identity/license | Ensure driver legitimacy   | Cannot apply to campaigns without verification |
| **Vehicle**    | Admin verifies per vehicle      | Ensure vehicle quality     | Cannot apply with unverified vehicle           |
| **Advertiser** | Admin verifies business         | Ensure business legitimacy | Cannot create campaigns without verification   |

### Workflow Overview

```
┌─────────────────┐
│  REGISTRATION   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ CREATE PROFILE  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ADMIN VERIFIES  │ ◄─── All three types require admin verification
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   CAN OPERATE   │
│                 │
│ Driver: Apply   │
│ Vehicle: Used   │
│ Advertiser:     │
│ Create Campaign │
└─────────────────┘
```

### API Endpoints Summary

**Admin Verification Endpoints**:

- `PATCH /api/drivers/:id/verify` - Verify driver
- `PATCH /api/drivers/:id/unverify` - Revoke driver verification
- `PATCH /api/vehicles/:id/verify` - Verify vehicle
- `PATCH /api/vehicles/:id/unverify` - Revoke vehicle verification
- `PATCH /api/advertisers/:id/verify` - Verify advertiser ✨ NEW
- `PATCH /api/advertisers/:id/unverify` - Revoke advertiser verification ✨ NEW

**Protected Actions**:

- Driver must be verified → Apply to campaigns
- Vehicle must be verified → Apply to campaigns
- Advertiser must be verified → Create campaigns ✨ NEW

## Best Practices

### For Admins

1. **Verify Business Documents**: Check registration, tax ID, business license
2. **Verify Contact Info**: Confirm phone/email with business
3. **Check Industry Compliance**: Ensure advertiser meets industry regulations
4. **Monitor Campaign Quality**: Revoke verification if campaigns are fraudulent

### For Advertisers

1. **Complete Profile**: Fill all business information accurately
2. **Provide Documentation**: Have business documents ready for verification
3. **Be Patient**: Verification may take 24-48 hours
4. **Maintain Good Standing**: Follow platform policies to keep verification

### Security Benefits

- ✅ Protects drivers from fraudulent campaigns
- ✅ Ensures payment legitimacy
- ✅ Builds platform trust
- ✅ Enables faster dispute resolution
- ✅ Provides audit trail for business dealings

---

**Complete verification system now implemented!** 🎉

All three user types (Driver, Vehicle, Advertiser) have proper admin verification controls.
