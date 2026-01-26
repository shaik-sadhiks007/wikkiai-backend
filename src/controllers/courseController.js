import Course from "../models/Course.js"

export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ createdAt: -1 })
    res.json({ courses })
  } catch (error) {
    console.error("Get courses error", error)
    res.status(500).json({ message: "Unable to fetch courses" })
  }
}

export const getCourseById = async (req, res) => {
  const { id } = req.params

  try {
    const course = await Course.findById(id)

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.json({ course })
  } catch (error) {
    console.error("Get course error", error)
    res.status(500).json({ message: "Unable to fetch course" })
  }
}

export const createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body)
    res.status(201).json({ course })
  } catch (error) {
    console.error("Create course error", error)
    res.status(500).json({ message: "Unable to create course" })
  }
}

export const updateCourse = async (req, res) => {
  const { id } = req.params

  try {
    const course = await Course.findByIdAndUpdate(id, req.body, { new: true })

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.json({ course })
  } catch (error) {
    console.error("Update course error", error)
    res.status(500).json({ message: "Unable to update course" })
  }
}

export const deleteCourse = async (req, res) => {
  const { id } = req.params

  try {
    const course = await Course.findByIdAndUpdate(id, { isActive: false }, { new: true })

    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    res.json({ message: "Course deleted successfully" })
  } catch (error) {
    console.error("Delete course error", error)
    res.status(500).json({ message: "Unable to delete course" })
  }
}

