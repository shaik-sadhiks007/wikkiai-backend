import { Router } from "express"
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js"
import { protect } from "../middleware/authMiddleware.js"

const router = Router()

router.get("/", getCourses)
router.get("/:id", getCourseById)

// Admin routes (you can add admin middleware later)
router.post("/", protect, createCourse)
router.put("/:id", protect, updateCourse)
router.delete("/:id", protect, deleteCourse)

export default router

