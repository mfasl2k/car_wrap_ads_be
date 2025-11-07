# Vehicle Image Upload API - Testing Guide

## Setup Cloudinary

1. **Sign up for free at:** https://cloudinary.com/users/register/free
2. **Get your credentials from Dashboard:**
   - Cloud name
   - API Key
   - API Secret
3. **Add to your `.env` file:**

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## API Endpoints

### 1. Upload Vehicle Photo

**POST** `/api/vehicles/:vehicleId/upload-photo`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Form Data:**

- Key: `photo`
- Type: File
- Value: Select image file (jpg, jpeg, png, webp)

**Example using Postman:**

1. Select POST method
2. URL: `http://localhost:5000/api/vehicles/:vehicleId/upload-photo`
3. Replace `:vehicleId` with actual vehicle ID
4. Authorization tab: Bearer Token
5. Body tab: Select `form-data`
6. Add key `photo` with type `File`
7. Click "Select Files" and choose an image
8. Click Send

**Example using cURL:**

```bash
curl -X POST http://localhost:5000/api/vehicles/VEHICLE_ID/upload-photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "photo=@/path/to/vehicle-photo.jpg"
```

**PowerShell:**

```powershell
$headers = @{
    Authorization = "Bearer YOUR_JWT_TOKEN"
}

$form = @{
    photo = Get-Item -Path "C:\path\to\vehicle-photo.jpg"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/vehicles/VEHICLE_ID/upload-photo" `
    -Method POST `
    -Headers $headers `
    -Form $form
```

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Vehicle photo uploaded successfully",
  "data": {
    "vehicle": {
      "vehicleId": "uuid",
      "driverId": "uuid",
      "make": "Toyota",
      "model": "Camry",
      "year": 2022,
      "color": "Silver",
      "registrationNumber": "ABC123",
      "vehicleType": "sedan",
      "sizeCategory": "medium",
      "photoUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/car_wrap_ads/vehicles/abc123.jpg",
      "isVerified": false,
      "createdAt": "2025-11-06T..."
    },
    "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/car_wrap_ads/vehicles/abc123.jpg"
  }
}
```

**Error Responses:**

**400 - No Image Uploaded:**

```json
{
  "status": "error",
  "message": "Please upload an image"
}
```

**400 - Invalid File Type:**

```json
{
  "status": "error",
  "message": "Only image files are allowed!"
}
```

**400 - File Too Large:**

```json
{
  "status": "error",
  "message": "File too large. Maximum size is 5MB"
}
```

**401 - Not Authenticated:**

```json
{
  "status": "error",
  "message": "Not authenticated"
}
```

**403 - Not Your Vehicle:**

```json
{
  "status": "error",
  "message": "You do not have permission to update this vehicle"
}
```

**404 - Vehicle Not Found:**

```json
{
  "status": "error",
  "message": "Vehicle not found"
}
```

---

### 2. Delete Vehicle Photo

**DELETE** `/api/vehicles/:vehicleId/photo`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**No body needed**

**Example using Postman:**

1. Select DELETE method
2. URL: `http://localhost:5000/api/vehicles/:vehicleId/photo`
3. Replace `:vehicleId` with actual vehicle ID
4. Authorization tab: Bearer Token
5. Click Send

**Example using cURL:**

```bash
curl -X DELETE http://localhost:5000/api/vehicles/VEHICLE_ID/photo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**PowerShell:**

```powershell
$headers = @{
    Authorization = "Bearer YOUR_JWT_TOKEN"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/vehicles/VEHICLE_ID/photo" `
    -Method DELETE `
    -Headers $headers
```

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Vehicle photo deleted successfully",
  "data": {
    "vehicle": {
      "vehicleId": "uuid",
      "driverId": "uuid",
      "make": "Toyota",
      "model": "Camry",
      "year": 2022,
      "color": "Silver",
      "registrationNumber": "ABC123",
      "vehicleType": "sedan",
      "sizeCategory": "medium",
      "photoUrl": null,
      "isVerified": false,
      "createdAt": "2025-11-06T..."
    }
  }
}
```

**Error Responses:**

**400 - No Photo to Delete:**

```json
{
  "status": "error",
  "message": "Vehicle has no photo to delete"
}
```

**404 - Vehicle Not Found:**

```json
{
  "status": "error",
  "message": "Vehicle not found"
}
```

---

## Testing Workflow

### Complete Test Sequence:

**1. Register and Login**

```json
POST /api/auth/register
{
  "email": "driver@example.com",
  "password": "password123",
  "userType": "driver"
}
```

_Copy the JWT token from response_

**2. Create Driver Profile**

```json
POST /api/drivers
Authorization: Bearer YOUR_TOKEN
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "city": "Auckland"
}
```

**3. Create Vehicle**

```json
POST /api/vehicles
Authorization: Bearer YOUR_TOKEN
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2022,
  "color": "Silver",
  "registrationNumber": "ABC123",
  "vehicleType": "sedan",
  "sizeCategory": "medium"
}
```

_Copy the vehicleId from response_

**4. Upload Vehicle Photo**

```
POST /api/vehicles/:vehicleId/upload-photo
Authorization: Bearer YOUR_TOKEN
Form-data: photo = [Select image file]
```

**5. Verify Photo URL**

- Copy the `photoUrl` from response
- Paste URL in browser to view uploaded image
- Image should be optimized and resized by Cloudinary

**6. Get Vehicle Details**

```
GET /api/vehicles/:vehicleId
Authorization: Bearer YOUR_TOKEN
```

_Verify photoUrl is present_

**7. Delete Photo (Optional)**

```
DELETE /api/vehicles/:vehicleId/photo
Authorization: Bearer YOUR_TOKEN
```

_Verify photoUrl is now null_

---

## Image Specifications

### Vehicle Photos:

- **Allowed formats:** JPG, JPEG, PNG, WebP
- **Max file size:** 5MB
- **Automatic optimization:**
  - Max dimensions: 1200x800px
  - Quality: Auto-optimized by Cloudinary
  - Format: Converted to WebP for modern browsers
- **Storage folder:** `car_wrap_ads/vehicles/`

### Benefits of Cloudinary:

✅ Automatic image optimization
✅ Responsive image delivery
✅ CDN for fast loading worldwide
✅ Automatic format conversion (WebP)
✅ Image transformations on-the-fly
✅ Free tier: 25GB storage, 25GB bandwidth/month

---

## Troubleshooting

### Error: "Missing required environment variable: CLOUDINARY_CLOUD_NAME"

**Solution:** Make sure you have added Cloudinary credentials to your `.env` file

### Error: "Only image files are allowed!"

**Solution:** Make sure you're uploading an image file (jpg, png, jpeg, webp)

### Error: "File too large"

**Solution:** Compress your image or use a smaller file (max 5MB)

### Error: "Cloudinary configuration error"

**Solution:** Verify your Cloudinary credentials are correct

### Upload works but can't see image in Cloudinary Dashboard

**Solution:** Check your Cloudinary console under "Media Library" → "car_wrap_ads" → "vehicles"

---

## Frontend Implementation Example (React)

```jsx
import { useState } from "react";
import axios from "axios";

function VehiclePhotoUpload({ vehicleId, token }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    setUploading(true);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/vehicles/${vehicleId}/upload-photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setPhotoUrl(response.data.data.imageUrl);
      alert("Photo uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Photo"}
      </button>
      {photoUrl && (
        <div>
          <img src={photoUrl} alt="Vehicle" style={{ maxWidth: "400px" }} />
        </div>
      )}
    </div>
  );
}
```

---

## Next Steps

After vehicle photo upload is working, you can extend this to:

- **Campaign wrap design uploads** (already configured in middleware)
- **Driver profile pictures**
- **Multiple images per vehicle** (gallery)
- **Image cropping/editing** before upload
- **Thumbnail generation** for listings

All the infrastructure is ready! 🚀
