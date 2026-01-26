import Cart from "../models/Cart.js"
import Course from "../models/Course.js"

export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate("items.course")
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] })
    }

    res.json({ cart })
  } catch (error) {
    console.error("Get cart error", error)
    res.status(500).json({ message: "Unable to fetch cart" })
  }
}

export const addToCart = async (req, res) => {
  const { courseId } = req.body

  try {
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    let cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] })
    }

    // Check if course already in cart
    const existingItem = cart.items.find(
      (item) => item.course.toString() === courseId
    )

    if (existingItem) {
      return res.status(400).json({ message: "Course already in cart" })
    }

    cart.items.push({ course: courseId })
    await cart.save()

    await cart.populate("items.course")

    res.json({ cart, message: "Course added to cart" })
  } catch (error) {
    console.error("Add to cart error", error)
    res.status(500).json({ message: "Unable to add to cart" })
  }
}

export const removeFromCart = async (req, res) => {
  const { courseId } = req.params

  try {
    const cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    cart.items = cart.items.filter(
      (item) => item.course.toString() !== courseId
    )
    await cart.save()

    await cart.populate("items.course")

    res.json({ cart, message: "Course removed from cart" })
  } catch (error) {
    console.error("Remove from cart error", error)
    res.status(500).json({ message: "Unable to remove from cart" })
  }
}

export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    cart.items = []
    await cart.save()

    res.json({ cart, message: "Cart cleared" })
  } catch (error) {
    console.error("Clear cart error", error)
    res.status(500).json({ message: "Unable to clear cart" })
  }
}

