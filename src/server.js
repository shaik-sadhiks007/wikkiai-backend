import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import morgan from "morgan"
import connectDB from "./config/db.js"
import authRoutes from "./routes/authRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import wishlistRoutes from "./routes/wishlistRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import adminOrderRoutes from "./routes/adminOrderRoutes.js"
import courseRoutes from "./routes/courseRoutes.js"

dotenv.config()

const app = express()
const port = process.env.PORT || 5000
const clientOrigins = process.env.CLIENT_URL?.split(",").map((url) => url.trim()) || ["http://localhost:5173"]

app.use(cors({ origin: clientOrigins, credentials: true }))
app.use(express.json())
app.use(morgan("dev"))

connectDB()

app.get("/health", (_req, res) => {
  res.json({ status: "ok", env: process.env.NODE_ENV || "development" })
})

app.use("/api/auth", authRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/wishlist", wishlistRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/admin/orders", adminOrderRoutes)
app.use("/api/courses", courseRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || "Server error" })
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

