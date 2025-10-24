import { Request, Response, NextFunction } from "express";
import {
  validationResult,
  ValidationChain,
  body,
  param,
  query,
} from "express-validator";
import { AppError } from "./errorHandler";

// Simple validation result checker - use as the last middleware in validation chain
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors: any[] = [];
  errors
    .array()
    .map((err: any) => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(400).json({
    status: "error",
    message: "Validation failed",
    errors: extractedErrors,
  });
};

// Common validation rules
export const validationRules = {
  // User validations
  register: [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    body("userType")
      .isIn(["driver", "advertiser"])
      .withMessage("User type must be either driver or advertiser"),
  ],

  login: [
    body("email")
      .isEmail()
      .withMessage("Please provide a valid email")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],

  // Driver validations
  createDriver: [
    body("firstName")
      .trim()
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("First name must be between 2 and 100 characters"),
    body("lastName")
      .trim()
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ min: 2, max: 100 })
      .withMessage("Last name must be between 2 and 100 characters"),
    body("phoneNumber")
      .optional()
      .isMobilePhone("any")
      .withMessage("Please provide a valid phone number"),
    body("dateOfBirth")
      .optional()
      .isISO8601()
      .withMessage("Please provide a valid date"),
    body("city")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("City must not exceed 100 characters"),
  ],

  // Vehicle validations
  createVehicle: [
    body("make")
      .trim()
      .notEmpty()
      .withMessage("Vehicle make is required")
      .isLength({ max: 50 })
      .withMessage("Make must not exceed 50 characters"),
    body("model")
      .trim()
      .notEmpty()
      .withMessage("Vehicle model is required")
      .isLength({ max: 50 })
      .withMessage("Model must not exceed 50 characters"),
    body("year")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Please provide a valid year"),
    body("registrationNumber")
      .trim()
      .notEmpty()
      .withMessage("Registration number is required")
      .isLength({ max: 20 })
      .withMessage("Registration number must not exceed 20 characters"),
    body("vehicleType")
      .optional()
      .isIn(["sedan", "suv", "van", "truck", "hatchback"])
      .withMessage("Invalid vehicle type"),
    body("sizeCategory")
      .optional()
      .isIn(["small", "medium", "large"])
      .withMessage("Invalid size category"),
  ],

  // Campaign validations
  createCampaign: [
    body("campaignName")
      .trim()
      .notEmpty()
      .withMessage("Campaign name is required")
      .isLength({ max: 200 })
      .withMessage("Campaign name must not exceed 200 characters"),
    body("startDate")
      .isISO8601()
      .withMessage("Please provide a valid start date")
      .custom((value, { req }) => {
        if (new Date(value) < new Date()) {
          throw new Error("Start date cannot be in the past");
        }
        return true;
      }),
    body("endDate")
      .isISO8601()
      .withMessage("Please provide a valid end date")
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.startDate)) {
          throw new Error("End date must be after start date");
        }
        return true;
      }),
    body("paymentPerDay")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Payment must be a positive number"),
    body("requiredDrivers")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Required drivers must be at least 1"),
  ],

  // Location validations
  createLocationPoint: [
    body("latitude")
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be between -90 and 90"),
    body("longitude")
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be between -180 and 180"),
    body("recordedAt")
      .isISO8601()
      .withMessage("Please provide a valid timestamp"),
    body("accuracyMeters")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Accuracy must be a positive number"),
    body("speedKmh")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Speed must be a positive number"),
  ],

  // ID validations
  uuidParam: [param("id").isUUID().withMessage("Invalid ID format")],

  // Pagination validations
  pagination: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
};
