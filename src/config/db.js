import mongoose from "mongoose"

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI
    if (!uri) {
      throw new Error("MONGO_URI is not set")
    }
    await mongoose.connect(uri)
    console.log("MongoDB connected")
  } catch (error) {
    console.error("Mongo connection error", error)
    process.exit(1)
  }
}

export default connectDB

