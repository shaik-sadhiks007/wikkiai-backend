import mongoose from "mongoose"

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: String, required: true, unique: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    courses: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    shippingAddress: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  },
  { timestamps: true }
)

const Order = mongoose.model("Order", orderSchema)

export default Order

