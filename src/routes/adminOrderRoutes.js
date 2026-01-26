import { Router } from "express"
import {
    getAllOrdersAdmin,
} from "../controllers/orderController.js"
import { protect, admin } from "../middleware/authMiddleware.js"

const router = Router()

// Admin routes - require both authentication and admin role
router.use(protect, admin)

router.get("/", getAllOrdersAdmin)

export default router
