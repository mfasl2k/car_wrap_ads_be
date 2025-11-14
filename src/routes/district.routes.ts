import express from "express";
import {
  getAllDistricts,
  getDistrictById,
  getDistrictsByCity,
  checkPointInDistrict,
} from "../controllers/district.controller";
import { authenticate } from "../middleware/auth";
import { body } from "express-validator";
import { validate } from "../middleware/validator";

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

/**
 * @route   GET /api/districts
 * @desc    Get all available districts
 * @access  Public
 * @query   city, region, isActive
 */
router.get("/", getAllDistricts);

/**
 * @route   GET /api/districts/by-city
 * @desc    Get districts grouped by city
 * @access  Public
 */
router.get("/by-city", getDistrictsByCity);

/**
 * @route   GET /api/districts/:districtId
 * @desc    Get single district by ID
 * @access  Public
 */
router.get("/:districtId", getDistrictById);

/**
 * @route   POST /api/districts/check-point
 * @desc    Check if a GPS point is within any district
 * @access  Public
 */
router.post(
  "/check-point",
  [
    body("latitude")
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be between -90 and 90"),
    body("longitude")
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be between -180 and 180"),
  ],
  validate,
  checkPointInDistrict
);

export default router;
