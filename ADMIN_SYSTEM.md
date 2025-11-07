# Admin System Documentation

## Overview

The Car Wrap Ads platform now has a secure admin system with three layers of protection:

1. **Public Registration Blocked**: Admin accounts cannot be created through the public `/api/auth/register` endpoint
2. **Seed Script**: First admin is created using a database seed script
3. **Admin-Only Creation**: Additional admins can only be created by existing admins through a protected endpoint

## Admin User Type

The system now supports three user types:
- `driver`: Regular drivers who can apply to campaigns
- `advertiser`: Businesses who create campaigns
- `admin`: System administrators who manage the platform

## Admin Capabilities

Admins have special permissions to:
- ✅ **Verify vehicles**: Approve vehicles for campaign participation
- ✅ **Unverify vehicles**: Revoke vehicle verification status
- ✅ **Create additional admins**: Invite new team members to admin role
- ✅ Access all standard authentication endpoints (login, logout, getMe)

## Security Architecture

### Layer 1: Public Registration Protection

The `/api/auth/register` endpoint only accepts `driver` or `advertiser` as userType:

```typescript
// Public registration is restricted
if (!['driver', 'advertiser'].includes(userType)) {
  throw new AppError('Invalid user type. Only driver and advertiser registration is allowed.', 400);
}
```

**Result**: Prevents anyone from creating admin accounts through public registration.

### Layer 2: Seed Script (First Admin)

The first admin is created using a Prisma seed script that runs directly against the database.

#### Running the Seed Script

```bash
npm run seed
```

#### Default Admin Credentials

**⚠️ IMPORTANT: Change these immediately after first login!**

- **Email**: `admin@carwrapad.com`
- **Password**: `Admin123!`

#### Environment Variables (Optional)

You can customize the default admin credentials using environment variables:

```env
# .env file
ADMIN_EMAIL=youradmin@company.com
ADMIN_PASSWORD=YourSecurePassword123!
```

Then run:
```bash
npm run seed
```

#### What the Seed Script Does

1. Creates or updates an admin user with the specified email
2. Hashes the password securely using bcrypt
3. Sets `userType` to `admin`
4. Sets `isActive` to `true` and `isVerified` to `true`
5. Uses `upsert()` so it's safe to run multiple times

### Layer 3: Admin-Only Creation Endpoint

Once you have at least one admin, you can create additional admins through the API.

#### Endpoint

```
POST /api/auth/admin/create
```

#### Authorization

Requires:
- Valid JWT token from an existing admin
- `Authorization: Bearer <admin_token>` header

#### Request Body

```json
{
  "email": "newadmin@company.com",
  "password": "SecurePassword123!"
}
```

#### Validation Rules

- **Email**: Must be valid email format, automatically normalized
- **Password**: Minimum 6 characters (recommend 12+ for production)

#### Response (Success - 201)

```json
{
  "status": "success",
  "message": "Admin user created successfully",
  "data": {
    "user": {
      "userId": "uuid-here",
      "email": "newadmin@company.com",
      "userType": "admin",
      "isActive": true,
      "isVerified": true,
      "createdAt": "2024-11-07T00:00:00.000Z",
      "updatedAt": "2024-11-07T00:00:00.000Z"
    }
  }
}
```

#### Response (Error - 400)

```json
{
  "status": "error",
  "message": "User with this email already exists"
}
```

#### Response (Error - 401)

```json
{
  "status": "error",
  "message": "Not authenticated"
}
```

#### Response (Error - 403)

```json
{
  "status": "error",
  "message": "Forbidden: Requires admin role"
}
```

## Complete Setup Workflow

### Step 1: Initial Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Seed the first admin
npm run seed
```

**Output**:
```
🌱 Starting database seeding...
✅ Admin user created/updated:
   Email: admin@carwrapad.com
   User ID: d4fd24d3-33a5-4f9d-9744-c3371e3c6493
   User Type: admin

⚠️  IMPORTANT: Please change the default password immediately after first login!
   Default credentials:
   Email: admin@carwrapad.com
   Password: Admin123!

🎉 Seeding completed successfully!
```

### Step 2: Login as Admin

**Request**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@carwrapad.com",
    "password": "Admin123!"
  }'
```

**PowerShell**:
```powershell
$body = @{
    email = "admin@carwrapad.com"
    password = "Admin123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

$adminToken = $response.data.token
Write-Host "Admin Token: $adminToken"
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "d4fd24d3-33a5-4f9d-9744-c3371e3c6493",
      "email": "admin@carwrapad.com",
      "userType": "admin",
      "isActive": true,
      "isVerified": true
    }
  }
}
```

### Step 3: Verify a Vehicle (Admin Function)

**Request**:
```bash
curl -X PATCH http://localhost:3000/api/vehicles/{vehicleId}/verify \
  -H "Authorization: Bearer <admin_token>"
```

**PowerShell**:
```powershell
$headers = @{
    Authorization = "Bearer $adminToken"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/vehicles/$vehicleId/verify" `
    -Method PATCH `
    -Headers $headers
```

### Step 4: Create Additional Admins

**Request**:
```bash
curl -X POST http://localhost:3000/api/auth/admin/create \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin2@carwrapad.com",
    "password": "SecurePassword456!"
  }'
```

**PowerShell**:
```powershell
$headers = @{
    Authorization = "Bearer $adminToken"
}

$body = @{
    email = "admin2@carwrapad.com"
    password = "SecurePassword456!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/admin/create" `
    -Method POST `
    -Headers $headers `
    -ContentType "application/json" `
    -Body $body
```

## Postman Testing Workflow

### Test 1: Verify Public Registration Blocked

**Request**: POST `{{base_url}}/api/auth/register`

**Body**:
```json
{
  "email": "hacker@evil.com",
  "password": "hacker123",
  "userType": "admin"
}
```

**Expected**: 400 Bad Request
```json
{
  "status": "error",
  "message": "Invalid user type. Only driver and advertiser registration is allowed."
}
```

### Test 2: Login as Seeded Admin

**Request**: POST `{{base_url}}/api/auth/login`

**Body**:
```json
{
  "email": "admin@carwrapad.com",
  "password": "Admin123!"
}
```

**Expected**: 200 OK with admin token

**Postman Test Script**:
```javascript
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("User type is admin", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.user.userType).to.eql("admin");
});

// Save admin token
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("admin_token", jsonData.data.token);
    pm.environment.set("admin_user_id", jsonData.data.user.userId);
}
```

### Test 3: Verify Vehicle (Admin Only)

**Request**: PATCH `{{base_url}}/api/vehicles/{{vehicle_id}}/verify`

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

**Expected**: 200 OK with verified vehicle

**Postman Test Script**:
```javascript
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Vehicle is verified", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.vehicle.isVerified).to.be.true;
});
```

### Test 4: Create Additional Admin

**Request**: POST `{{base_url}}/api/auth/admin/create`

**Headers**:
```
Authorization: Bearer {{admin_token}}
```

**Body**:
```json
{
  "email": "admin2@carwrapad.com",
  "password": "SecurePassword456!"
}
```

**Expected**: 201 Created

**Postman Test Script**:
```javascript
pm.test("Status is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Admin created successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data.user.userType).to.eql("admin");
    pm.expect(jsonData.data.user.email).to.eql("admin2@carwrapad.com");
});

// Save second admin ID
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("admin2_user_id", jsonData.data.user.userId);
}
```

### Test 5: Verify Non-Admin Cannot Create Admin

**Request**: POST `{{base_url}}/api/auth/admin/create`

**Headers**:
```
Authorization: Bearer {{driver_token}}
```

**Body**:
```json
{
  "email": "admin3@carwrapad.com",
  "password": "SecurePassword789!"
}
```

**Expected**: 403 Forbidden
```json
{
  "status": "error",
  "message": "Forbidden: Requires admin role"
}
```

## Production Recommendations

### 1. Change Default Admin Password

**Immediately** after first login, create a new admin with a strong password and disable the default admin:

1. Login as default admin
2. Create new admin with secure credentials
3. Login as new admin
4. Change default admin password or deactivate account

### 2. Use Strong Passwords

For production admins, enforce:
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, special characters
- No dictionary words
- Regular password rotation

### 3. Environment Variables

Store sensitive admin credentials in environment variables:

```env
# Production .env (never commit this file!)
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=VerySecurePassword123!@#
```

### 4. Audit Logging

Consider adding audit logs for admin actions:
- Track admin logins
- Log vehicle verifications
- Record admin user creations
- Monitor suspicious activity

### 5. Rate Limiting

Implement rate limiting on admin endpoints to prevent brute force:
- Limit login attempts
- Throttle admin creation requests
- Monitor for unusual patterns

### 6. Two-Factor Authentication (Future)

For enhanced security, consider implementing 2FA for admin accounts.

## API Endpoints Summary

| Endpoint | Method | Auth | Role | Description |
|----------|--------|------|------|-------------|
| `/api/auth/register` | POST | ❌ | Public | Register driver/advertiser (admin blocked) |
| `/api/auth/login` | POST | ❌ | Public | Login any user type |
| `/api/auth/logout` | POST | ✅ | Any | Logout (client-side token removal) |
| `/api/auth/me` | GET | ✅ | Any | Get current user info |
| `/api/auth/admin/create` | POST | ✅ | Admin | Create new admin user |
| `/api/vehicles/:id/verify` | PATCH | ✅ | Admin | Verify vehicle |
| `/api/vehicles/:id/unverify` | PATCH | ✅ | Admin | Unverify vehicle |

## Troubleshooting

### Problem: Seed script fails

**Solution**: Check database connection and ensure migrations are up to date
```bash
npx prisma migrate dev
npm run seed
```

### Problem: Cannot login as admin

**Solution**: Verify admin was created by seed script
```bash
# Check database
npx prisma studio

# Navigate to User table
# Find user with userType = 'admin'
```

### Problem: Admin creation returns 403

**Solution**: Ensure you're using an admin token, not driver or advertiser token

### Problem: Forgot admin password

**Solution**: Run seed script again (it will update the password)
```bash
npm run seed
```

## File Changes Summary

### New Files Created
1. `prisma/seed.ts` - Database seeding script for first admin
2. `ADMIN_SYSTEM.md` - This documentation file

### Modified Files
1. `src/controllers/auth.controller.ts`
   - Modified `register()` to block admin user type
   - Added `createAdmin()` function for admin-only user creation

2. `src/routes/auth.routes.ts`
   - Added `createAdminValidation` rules
   - Added POST `/admin/create` route with admin authorization

3. `package.json`
   - Added `"seed": "ts-node prisma/seed.ts"` script
   - Added `"prisma": { "seed": "ts-node prisma/seed.ts" }` configuration

4. `prisma/schema.prisma` (Previously updated)
   - Added `admin` to UserType enum

5. All type definition files (Previously updated)
   - Updated to include `admin` in user type unions

## Security Checklist

- [x] Admin cannot be registered through public endpoint
- [x] First admin created via secure seed script
- [x] Additional admins require existing admin authorization
- [x] Passwords hashed using bcrypt
- [x] JWT authentication required for all admin actions
- [x] Role-based authorization enforced by middleware
- [x] Vehicle verification restricted to admins only
- [ ] Default admin password changed (YOUR ACTION REQUIRED)
- [ ] Environment variables configured for production
- [ ] Audit logging implemented (Optional enhancement)
- [ ] Rate limiting configured (Optional enhancement)

## Next Steps

1. ✅ Run seed script: `npm run seed`
2. ✅ Login as admin
3. ⚠️ **Change default admin password immediately**
4. ✅ Test vehicle verification
5. ✅ Create additional admins as needed
6. 📝 Document your team's admin credentials securely
7. 🔒 Store admin credentials in password manager
8. 🚀 Deploy to production with environment variables

---

**Security Note**: This three-layer approach ensures that admin accounts are strictly controlled and cannot be created through public registration, while still providing flexibility for authorized admins to manage the team.
