import { Router } from "express";
import { body } from "express-validator";
import {
  createDriver,
  getMyDriverProfile,
  getDriverById,
  updateDriverProfile,
  deleteDriverProfile,
  getAllDrivers,
} from "../controllers/driver.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validator";

const router = Router();

// Validation rules for driver creation
const createDriverValidation = [
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
  body("driversLicenseNumber")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("License number must not exceed 50 characters"),
  body("city")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("City must not exceed 100 characters"),
  body("region")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Region must not exceed 100 characters"),
  validate,
];

// Validation rules for driver update
const updateDriverValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("First name must be between 2 and 100 characters"),
  body("lastName")
    .optional()
    .trim()
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
  body("driversLicenseNumber")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("License number must not exceed 50 characters"),
  body("city")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("City must not exceed 100 characters"),
  body("region")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Region must not exceed 100 characters"),
  validate,
];

// Protected routes - require authentication
router.use(authenticate);

// Driver-specific routes
router.post("/", authorize("driver"), createDriverValidation, createDriver);
router.get("/me", authorize("driver"), getMyDriverProfile);
router.put(
  "/me",
  authorize("driver"),
  updateDriverValidation,
  updateDriverProfile
);
router.delete("/me", authorize("driver"), deleteDriverProfile);

// Public/Admin routes
router.get("/", getAllDrivers);
router.get("/:driverId", getDriverById);

export default router;
