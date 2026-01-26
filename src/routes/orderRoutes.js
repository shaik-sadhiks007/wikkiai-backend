import { Router } from "express"
import {
  createOrder,
  verifyPayment,
  getOrders,
  getOrderById,
} from "../controllers/orderController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = Router()

router.use(protect)

router.post("/", createOrder)
router.post("/verify", verifyPayment)
router.get("/", getOrders)
router.get("/:orderId", getOrderById)

export default router

