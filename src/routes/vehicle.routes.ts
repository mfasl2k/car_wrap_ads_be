import { Router } from "express";
import { body } from "express-validator";
import {
  createVehicle,
  getMyVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getAllVehicles,
} from "../controllers/vehicle.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validator";

const router = Router();

// Validation rules for vehicle creation
const createVehicleValidation = [
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
  body("color")
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Color must not exceed 30 characters"),
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
  body("photoUrl").optional().isURL().withMessage("Please provide a valid URL"),
  validate,
];

// Validation rules for vehicle update
const updateVehicleValidation = [
  body("make")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Make must not exceed 50 characters"),
  body("model")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Model must not exceed 50 characters"),
  body("year")
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage("Please provide a valid year"),
  body("color")
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Color must not exceed 30 characters"),
  body("registrationNumber")
    .optional()
    .trim()
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
  body("photoUrl").optional().isURL().withMessage("Please provide a valid URL"),
  validate,
];

// Protected routes - require authentication
router.use(authenticate);

// Driver-specific routes
router.post("/", authorize("driver"), createVehicleValidation, createVehicle);
router.get("/my", authorize("driver"), getMyVehicles);
router.put(
  "/:vehicleId",
  authorize("driver"),
  updateVehicleValidation,
  updateVehicle
);
router.delete("/:vehicleId", authorize("driver"), deleteVehicle);

// Public/Admin routes
router.get("/", getAllVehicles);
router.get("/:vehicleId", getVehicleById);

export default router;
