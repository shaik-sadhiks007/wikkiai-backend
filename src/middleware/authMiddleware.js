import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "change-me")
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: "Token invalid" })
  }
}

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    res.status(403).json({ message: "Not authorized as admin" })
  }
}

