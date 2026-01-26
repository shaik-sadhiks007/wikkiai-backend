import mongoose from "mongoose"

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    fullDescription: { type: String },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    duration: { type: String, required: true },
    students: { type: String, default: "0" },
    rating: { type: Number, default: 0 },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], required: true },
    category: { type: String, required: true },
    image: { type: String },
    modules: [
      {
        title: String,
        topics: [String],
      },
    ],
    learningOutcomes: [String],
    prerequisites: [String],
    careerPaths: [String],
    features: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const Course = mongoose.model("Course", courseSchema)

export default Course

