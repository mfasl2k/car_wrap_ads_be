// User Types
export interface User {
  userId: string;
  email: string;
  passwordHash: string;
  userType: 'driver' | 'advertiser' | 'admin';
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Driver {
  driverId: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  driversLicenseNumber?: string;
  city?: string;
  region?: string;
  averageRating: number;
  totalCampaignsCompleted: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Advertiser {
  advertiserId: string;
  userId: string;
  companyName: string;
  contactPerson?: string;
  phoneNumber?: string;
  businessAddress?: string;
  city?: string;
  industry?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  vehicleId: string;
  driverId: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  registrationNumber: string;
  vehicleType?: VehicleType;
  sizeCategory?: SizeCategory;
  photoUrl?: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface Notification {
  notificationId: string;
  userId: string;
  title: string;
  message?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Campaign {
  campaignId: string;
  advertiserId: string;
  campaignName: string;
  description?: string;
  status: CampaignStatus;
  startDate: Date;
  endDate: Date;
  paymentPerDay?: number;
  requiredDrivers: number;
  wrapDesignUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DriverCampaign {
  driverCampaignId: string;
  driverId: string;
  campaignId: string;
  status: DriverCampaignStatus;
  matchScore?: number;
  startDate?: Date;
  endDate?: Date;
  appliedAt: Date;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
}

export interface LocationTrack {
  trackId: string;
  driverId: string;
  driverCampaignId?: string;
  trackDate: Date;
  startTime?: Date;
  endTime?: Date;
  distanceKm?: number;
  durationHours?: number;
  estimatedImpressions: number;
  isSynced: boolean;
  syncedAt?: Date;
  createdAt: Date;
}

export interface LocationPoint {
  pointId: string;
  trackId: string;
  recordedAt: Date;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  speedKmh?: number;
  isSynced: boolean;
  createdAt: Date;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  userType: 'driver' | 'advertiser' | 'admin';
  // Additional fields based on userType
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    userId: string;
    email: string;
    userType: 'driver' | 'advertiser' | 'admin';
  };
}

// API Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: any[];
}

// Campaign Types
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
export type DriverCampaignStatus = 'pending' | 'approved' | 'active' | 'completed' | 'rejected';
export type VehicleType = 'sedan' | 'suv' | 'van' | 'truck' | 'hatchback';
export type SizeCategory = 'small' | 'medium' | 'large';
