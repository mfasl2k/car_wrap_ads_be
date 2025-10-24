import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { hashPassword, comparePassword, generateToken } from "../utils/auth";
import { AppError } from "../middleware/errorHandler";
import { asyncHandler } from "../middleware/errorHandler";

const prisma = new PrismaClient();

interface RegisterRequest {
  email: string;
  password: string;
  userType: "driver" | "advertiser";
}

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(
  async (
    req: Request<{}, {}, RegisterRequest>,
    res: Response,
    next: NextFunction
  ) => {
    const { email, password, userType } = req.body;

    // Validate required fields
    if (!email || !password || !userType) {
      throw new AppError("Please provide email, password, and userType", 400);
    }

    // Validate userType
    if (!["driver", "advertiser"].includes(userType)) {
      throw new AppError(
        'userType must be either "driver" or "advertiser"',
        400
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        userType,
      },
      select: {
        userId: true,
        email: true,
        userType: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.userId,
      userType: user.userType as "driver" | "advertiser",
    });

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user,
        token,
      },
    });
  }
);

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(
  async (
    req: Request<{}, {}, LoginRequest>,
    res: Response,
    next: NextFunction
  ) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new AppError("Please provide email and password", 400);
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Compare passwords
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.userId,
      userType: user.userType as "driver" | "advertiser",
    });

    // Return user data without password
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  }
);

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Not authenticated", 401);
    }

    // Find user by ID from JWT payload
    const user = await prisma.user.findUnique({
      where: { userId: req.user.userId },
      select: {
        userId: true,
        email: true,
        userType: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  }
);

/**
 * Logout user (client-side token removal)
 * POST /api/auth/logout
 */
export const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // In a JWT-based auth system, logout is typically handled client-side
    // by removing the token from storage
    res.status(200).json({
      status: "success",
      message:
        "Logout successful. Please remove the token from client storage.",
    });
  }
);
