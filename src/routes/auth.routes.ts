import { Router } from "express";
import { body } from "express-validator";
import { register, login, logout, getMe } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validator";

const router = Router();

// Validation rules for registration
const registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("userType")
    .isIn(["driver", "advertiser"])
    .withMessage('userType must be either "driver" or "advertiser"'),
  validate,
];

// Validation rules for login
const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

// Public routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);

// Protected routes
router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logout);

export default router;
