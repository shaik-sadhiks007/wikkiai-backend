import mongoose from "mongoose"

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

cartSchema.methods.calculateTotal = function () {
  return this.items.reduce((total, item) => {
    return total + (item.course?.price || 0)
  }, 0)
}

const Cart = mongoose.model("Cart", cartSchema)

export default Cart

