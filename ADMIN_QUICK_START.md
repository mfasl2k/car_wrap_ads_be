# Admin Quick Start Guide

## 🚀 Quick Setup (3 Steps)

### 1. Create First Admin
```bash
npm run seed
```

**Default Credentials**:
- Email: `admin@carwrapad.com`
- Password: `Admin123!`

### 2. Login as Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@carwrapad.com","password":"Admin123!"}'
```

Save the token from response!

### 3. Use Admin Token

```bash
# Verify a vehicle
curl -X PATCH http://localhost:3000/api/vehicles/{vehicleId}/verify \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Create another admin
curl -X POST http://localhost:3000/api/auth/admin/create \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin2@company.com","password":"SecurePass123!"}'
```

## 📋 PowerShell Version

```powershell
# 1. Seed admin
npm run seed

# 2. Login
$body = @{
    email = "admin@carwrapad.com"
    password = "Admin123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
    -Method POST -ContentType "application/json" -Body $body

$adminToken = $response.data.token

# 3. Verify vehicle
$headers = @{ Authorization = "Bearer $adminToken" }

Invoke-RestMethod -Uri "http://localhost:3000/api/vehicles/$vehicleId/verify" `
    -Method PATCH -Headers $headers
```

## 🔐 Admin Capabilities

| Action | Endpoint | Method |
|--------|----------|--------|
| Verify Vehicle | `/api/vehicles/:id/verify` | PATCH |
| Unverify Vehicle | `/api/vehicles/:id/unverify` | PATCH |
| Create Admin | `/api/auth/admin/create` | POST |
| Get Profile | `/api/auth/me` | GET |

## ⚠️ Important Notes

1. **Change default password immediately!**
2. Admin **cannot** be created via `/api/auth/register`
3. Only existing admins can create new admins
4. Keep admin credentials secure
5. Use environment variables in production:
   ```env
   ADMIN_EMAIL=your@email.com
   ADMIN_PASSWORD=YourSecurePassword
   ```

## 🐛 Troubleshooting

**Can't login?** Re-run seed script:
```bash
npm run seed
```

**Need to reset admin password?** Update .env and re-seed:
```env
ADMIN_EMAIL=admin@carwrapad.com
ADMIN_PASSWORD=NewPassword123!
```
```bash
npm run seed
```

## 📚 Full Documentation

See `ADMIN_SYSTEM.md` for complete details.
