import Wishlist from "../models/Wishlist.js"
import Course from "../models/Course.js"

export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("courses.course")
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, courses: [] })
    }

    res.json({ wishlist })
  } catch (error) {
    console.error("Get wishlist error", error)
    res.status(500).json({ message: "Unable to fetch wishlist" })
  }
}

export const addToWishlist = async (req, res) => {
  const { courseId } = req.body

  try {
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id })

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, courses: [] })
    }

    // Check if course already in wishlist
    const existingItem = wishlist.courses.find(
      (item) => item.course.toString() === courseId
    )

    if (existingItem) {
      return res.status(400).json({ message: "Course already in wishlist" })
    }

    wishlist.courses.push({ course: courseId })
    await wishlist.save()

    await wishlist.populate("courses.course")

    res.json({ wishlist, message: "Course added to wishlist" })
  } catch (error) {
    console.error("Add to wishlist error", error)
    res.status(500).json({ message: "Unable to add to wishlist" })
  }
}

export const removeFromWishlist = async (req, res) => {
  const { courseId } = req.params

  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" })
    }

    wishlist.courses = wishlist.courses.filter(
      (item) => item.course.toString() !== courseId
    )
    await wishlist.save()

    await wishlist.populate("courses.course")

    res.json({ wishlist, message: "Course removed from wishlist" })
  } catch (error) {
    console.error("Remove from wishlist error", error)
    res.status(500).json({ message: "Unable to remove from wishlist" })
  }
}

