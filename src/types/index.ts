// User Types
export interface User {
  userId: string;
  email: string;
  passwordHash: string;
  userType: 'driver' | 'advertiser';
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

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  userType: 'driver' | 'advertiser';
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
    userType: 'driver' | 'advertiser';
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
