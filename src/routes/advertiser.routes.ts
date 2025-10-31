import { Router } from "express";
import { body } from "express-validator";
import {
  createAdvertiser,
  getMyAdvertiserProfile,
  getAdvertiserById,
  updateAdvertiserProfile,
  deleteAdvertiserProfile,
  getAllAdvertisers,
} from "../controllers/advertiser.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validator";

const router = Router();

// Validation rules for advertiser creation
const createAdvertiserValidation = [
  body("companyName")
    .trim()
    .notEmpty()
    .withMessage("Company name is required")
    .isLength({ min: 2, max: 200 })
    .withMessage("Company name must be between 2 and 200 characters"),
  body("contactPerson")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Contact person must not exceed 100 characters"),
  body("phoneNumber")
    .optional()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),
  body("businessAddress")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Business address must not exceed 255 characters"),
  body("city")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("City must not exceed 100 characters"),
  body("industry")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Industry must not exceed 100 characters"),
  validate,
];

// Validation rules for advertiser update
const updateAdvertiserValidation = [
  body("companyName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Company name must be between 2 and 200 characters"),
  body("contactPerson")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Contact person must not exceed 100 characters"),
  body("phoneNumber")
    .optional()
    .isMobilePhone("any")
    .withMessage("Please provide a valid phone number"),
  body("businessAddress")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Business address must not exceed 255 characters"),
  body("city")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("City must not exceed 100 characters"),
  body("industry")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Industry must not exceed 100 characters"),
  validate,
];

// Protected routes - require authentication
router.use(authenticate);

// Advertiser-specific routes
router.post(
  "/",
  authorize("advertiser"),
  createAdvertiserValidation,
  createAdvertiser
);
router.get("/me", authorize("advertiser"), getMyAdvertiserProfile);
router.put(
  "/me",
  authorize("advertiser"),
  updateAdvertiserValidation,
  updateAdvertiserProfile
);
router.delete("/me", authorize("advertiser"), deleteAdvertiserProfile);

// Public/Admin routes
router.get("/", getAllAdvertisers);
router.get("/:advertiserId", getAdvertiserById);

export default router;
