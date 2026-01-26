import { Router } from "express"
import { body } from "express-validator"
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = Router()

router.use(protect)

router.get("/", getCart)
router.post(
  "/",
  [body("courseId").notEmpty().withMessage("Course ID is required")],
  addToCart
)
router.delete("/:courseId", removeFromCart)
router.delete("/", clearCart)

export default router

