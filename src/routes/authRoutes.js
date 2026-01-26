import { Router } from "express"
import { body } from "express-validator"
import { login, profile, register, googleAuth } from "../controllers/authController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = Router()

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").optional().isLength({ min: 6 }).withMessage("Password must be 6+ characters"),
  ],
  register
)

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").optional().notEmpty().withMessage("Password is required"),
  ],
  login
)

router.post(
  "/google",
  [
    body("firebaseToken").notEmpty().withMessage("Firebase token is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("name").optional().notEmpty().withMessage("Name is required"),
  ],
  googleAuth
)

router.get("/profile", protect, profile)

export default router

