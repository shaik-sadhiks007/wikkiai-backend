import Order from "../models/Order.js"
import Cart from "../models/Cart.js"
import Course from "../models/Course.js"
import crypto from "crypto"
import Razorpay from "razorpay"

// const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID
// const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET


const RAZORPAY_KEY_ID = "rzp_test_RpByExv2gBYi8O"
const RAZORPAY_KEY_SECRET = "L2efg7XU0Y1DyWJ1VkUNMuM1"


if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error("⚠️  Razorpay credentials not found in environment variables")
  console.error("Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file")
}

// Initialize Razorpay instance (only if credentials exist)
let razorpay = null
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  })
  console.log("✅ Razorpay initialized successfully")
}

export const createOrder = async (req, res) => {
  const { shippingAddress } = req.body

  try {
    // Check if Razorpay is initialized
    if (!razorpay) {
      return res.status(500).json({
        message: "Payment gateway not configured. Please contact administrator."
      })
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("items.course")

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" })
    }

    const courses = cart.items.map((item) => ({
      course: item.course._id,
      price: item.course.price,
    }))

    const totalAmount = courses.reduce((sum, item) => sum + item.price, 0)

    // Generate unique receipt ID
    const receiptId = `ORD${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // Amount in paise
      currency: "INR",
      receipt: receiptId,
      notes: {
        userId: req.user._id.toString(),
        numberOfCourses: courses.length,
      },
    })

    // Create order in database
    const order = await Order.create({
      user: req.user._id,
      orderId: receiptId,
      razorpayOrderId: razorpayOrder.id,
      courses,
      totalAmount,
      shippingAddress,
      status: "pending",
      paymentStatus: "pending",
    })

    // Return order details for Razorpay integration
    res.json({
      order,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount * 100, // Amount in paise
      currency: "INR",
      keyId: RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error("Create order error", error)
    res.status(500).json({
      message: "Unable to create order",
      error: error.message
    })
  }
}

export const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body

  try {
    const order = await Order.findOne({ orderId, user: req.user._id })

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Verify Razorpay signature
    const text = `${order.razorpayOrderId}|${razorpayPaymentId}`
    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex")

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Invalid payment signature" })
    }

    // Update order
    order.razorpayPaymentId = razorpayPaymentId
    order.razorpaySignature = razorpaySignature
    order.paymentStatus = "completed"
    order.status = "completed"
    await order.save()

    // Clear cart
    const cart = await Cart.findOne({ user: req.user._id })
    if (cart) {
      cart.items = []
      await cart.save()
    }

    res.json({ order, message: "Payment verified successfully" })
  } catch (error) {
    console.error("Verify payment error", error)
    res.status(500).json({ message: "Unable to verify payment" })
  }
}

// User endpoint - get user's own orders
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("courses.course")
      .sort({ createdAt: -1 })

    res.json({ orders })
  } catch (error) {
    console.error("Get orders error", error)
    res.status(500).json({ message: "Unable to fetch orders" })
  }
}

export const getOrderById = async (req, res) => {
  const { orderId } = req.params

  try {
    const order = await Order.findOne({ orderId, user: req.user._id }).populate("courses.course")

    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    res.json({ order })
  } catch (error) {
    console.error("Get order error", error)
    res.status(500).json({ message: "Unable to fetch order" })
  }
}

// Admin endpoint - get all orders with user info
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("courses.course")
      .sort({ createdAt: -1 })

    res.json({ orders })
  } catch (error) {
    console.error("Get all orders error", error)
    res.status(500).json({ message: "Unable to fetch orders" })
  }
}
