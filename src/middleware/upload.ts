import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';
import { Request } from 'express';

// Configure Cloudinary storage for vehicle photos
const vehicleStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'car_wrap_ads/vehicles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit' }, // Max dimensions
      { quality: 'auto' }, // Automatic quality optimization
    ],
  } as any,
});

// Configure Cloudinary storage for campaign wrap designs
const campaignStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'car_wrap_ads/campaigns',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1500, height: 1000, crop: 'limit' },
      { quality: 'auto' },
    ],
  } as any,
});

// File filter to validate image types
const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept images only
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed!'));
  }
  cb(null, true);
};

// Multer upload middleware for vehicle photos
export const uploadVehiclePhoto = multer({
  storage: vehicleStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Multer upload middleware for campaign wrap designs
export const uploadCampaignDesign = multer({
  storage: campaignStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Helper function to delete image from Cloudinary
export const deleteImageFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    // Extract public_id from Cloudinary URL
    const urlParts = imageUrl.split('/');
    const fileWithExtension = urlParts[urlParts.length - 1];
    const fileName = fileWithExtension.split('.')[0];
    const folder = urlParts[urlParts.length - 2];
    const publicId = `car_wrap_ads/${folder}/${fileName}`;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};
