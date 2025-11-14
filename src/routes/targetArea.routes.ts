import { Router } from "express";
import { body, param } from "express-validator";
import {
  createTargetArea,
  getCampaignTargetAreas,
  getTargetAreaById,
  updateTargetArea,
  deleteTargetArea,
  checkPointInTargetArea,
} from "../controllers/targetArea.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validator";

const router = Router();

// Validation for creating target area (district-based)
const createTargetAreaValidation = [
  param("campaignId").isUUID().withMessage("Invalid campaign ID"),
  body("districtId")
    .notEmpty()
    .withMessage("District ID is required")
    .isUUID()
    .withMessage("Invalid district ID format"),
  body("priorityLevel")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Priority level must be between 1 and 10"),
  validate,
];

// Validation for updating target area (only priority level can be updated)
const updateTargetAreaValidation = [
  param("areaId").isUUID().withMessage("Invalid area ID"),
  body("priorityLevel")
    .notEmpty()
    .withMessage("Priority level is required")
    .isInt({ min: 1, max: 10 })
    .withMessage("Priority level must be between 1 and 10"),
  validate,
];

// Validation for checking point
const checkPointValidation = [
  param("campaignId").isUUID().withMessage("Invalid campaign ID"),
  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  validate,
];

// Protected routes - require authentication
router.use(authenticate);

// Campaign target area routes
router.post(
  "/campaigns/:campaignId/target-areas",
  authorize("advertiser"),
  createTargetAreaValidation,
  createTargetArea
);

router.get("/campaigns/:campaignId/target-areas", getCampaignTargetAreas);

router.post(
  "/campaigns/:campaignId/target-areas/check-point",
  checkPointValidation,
  checkPointInTargetArea
);

// Individual target area routes
router.get(
  "/target-areas/:areaId",
  param("areaId").isUUID(),
  validate,
  getTargetAreaById
);

router.put(
  "/target-areas/:areaId",
  authorize("advertiser"),
  updateTargetAreaValidation,
  updateTargetArea
);

router.delete(
  "/target-areas/:areaId",
  authorize("advertiser"),
  param("areaId").isUUID(),
  validate,
  deleteTargetArea
);

export default router;
