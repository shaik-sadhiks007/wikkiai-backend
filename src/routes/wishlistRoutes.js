import { Router } from "express"
import { body } from "express-validator"
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = Router()

router.use(protect)

router.get("/", getWishlist)
router.post(
  "/",
  [body("courseId").notEmpty().withMessage("Course ID is required")],
  addToWishlist
)
router.delete("/:courseId", removeFromWishlist)

export default router

