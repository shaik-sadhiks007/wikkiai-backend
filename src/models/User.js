import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String }, // Optional for Google sign-in users
    firebaseUid: { type: String },
    isVerified: { type: Boolean, default: false },
    authProvider: { type: String, enum: ["email", "google"], default: "email" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
)

userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

const User = mongoose.model("User", userSchema)

export default User

