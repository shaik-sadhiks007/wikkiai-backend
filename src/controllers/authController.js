import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { validationResult } from "express-validator"
import admin from "../config/firebase.js"
import User from "../models/User.js"

const tokenSecret = process.env.JWT_SECRET || "change-me"
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"

const generateToken = (id) => jwt.sign({ id }, tokenSecret, { expiresIn: "7d" })

const ensureFirebaseUser = async (email, name) => {
  try {
    const existing = await admin.auth().getUserByEmail(email)
    return existing
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      const created = await admin.auth().createUser({ email, displayName: name })
      return created
    }
    throw error
  }
}

const verifyFirebaseToken = async (firebaseToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken)
    return decodedToken
  } catch (error) {
    throw new Error("Invalid Firebase token")
  }
}

export const register = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }

  const { name, email, password, firebaseToken } = req.body

  // Password is required if no Firebase token is provided
  if (!firebaseToken && !password) {
    return res.status(400).json({ message: "Password is required" })
  }

  if (password && password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" })
  }

  try {
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: "User already exists with this email" })
    }

    let firebaseUser
    if (firebaseToken) {
      // Verify Firebase token
      const decodedToken = await verifyFirebaseToken(firebaseToken)
      firebaseUser = await admin.auth().getUser(decodedToken.uid)
    } else {
      // Create Firebase user if token not provided
      firebaseUser = await ensureFirebaseUser(email, name)
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined
    const verificationLink = await admin
      .auth()
      .generateEmailVerificationLink(email, { url: `${clientUrl}/login` })

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      firebaseUid: firebaseUser.uid,
      isVerified: false,
      authProvider: "email",
    })

    const token = generateToken(user._id)

    res.status(201).json({
      user: user.toSafeJSON(),
      token,
      verificationLink,
      message: "Registration successful. Please verify your email.",
    })
  } catch (error) {
    console.error("Register error", error)
    res.status(500).json({ message: error.message || "Unable to register" })
  }
}

export const login = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }

  const { email, password, firebaseToken } = req.body

  // Password is required if no Firebase token is provided
  if (!firebaseToken && !password) {
    return res.status(400).json({ message: "Password or Firebase token is required" })
  }

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // If Firebase token is provided, verify it
    if (firebaseToken) {
      const decodedToken = await verifyFirebaseToken(firebaseToken)
      const firebaseUser = await admin.auth().getUser(decodedToken.uid)
      
      if (firebaseUser.email !== email) {
        return res.status(400).json({ message: "Invalid credentials" })
      }

      // Update Firebase UID if not set
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUser.uid
        await user.save()
      }

      // Check email verification
      if (!firebaseUser.emailVerified) {
        return res.status(403).json({ message: "Email not verified. Please check your inbox." })
      }
    } else {
      // Traditional password login
      if (!user.password) {
        return res.status(400).json({ message: "Please use Google sign-in for this account" })
      }

      const passwordMatch = await bcrypt.compare(password, user.password)
      if (!passwordMatch) {
        return res.status(400).json({ message: "Invalid credentials" })
      }

      const firebaseUser = await admin.auth().getUserByEmail(email)
      if (!firebaseUser.emailVerified) {
        return res.status(403).json({ message: "Email not verified. Please check your inbox." })
      }
    }

    if (!user.isVerified) {
      user.isVerified = true
      await user.save()
    }

    const token = generateToken(user._id)

    res.json({
      user: user.toSafeJSON(),
      token,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login error", error)
    res.status(500).json({ message: error.message || "Unable to login" })
  }
}

export const googleAuth = async (req, res) => {
  const { firebaseToken, name, email } = req.body

  if (!firebaseToken) {
    return res.status(400).json({ message: "Firebase token is required" })
  }

  try {
    // Verify Firebase token
    const decodedToken = await verifyFirebaseToken(firebaseToken)
    const firebaseUser = await admin.auth().getUser(decodedToken.uid)

    if (firebaseUser.email !== email) {
      return res.status(400).json({ message: "Email mismatch" })
    }

    // Check if user exists
    let user = await User.findOne({ email })

    if (user) {
      // Update Firebase UID if not set
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUser.uid
        await user.save()
      }
    } else {
      // Create new user
      user = await User.create({
        name: name || firebaseUser.displayName || email.split("@")[0],
        email,
        firebaseUid: firebaseUser.uid,
        isVerified: true, // Google accounts are pre-verified
        authProvider: "google",
      })
    }

    // Update verification status
    if (!user.isVerified) {
      user.isVerified = true
      await user.save()
    }

    const token = generateToken(user._id)

    res.json({
      user: user.toSafeJSON(),
      token,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Google auth error", error)
    res.status(500).json({ message: error.message || "Unable to authenticate" })
  }
}

export const profile = async (req, res) => {
  try {
    const user = req.user
    return res.json({ user: user.toSafeJSON() })
  } catch (error) {
    res.status(500).json({ message: "Unable to fetch profile" })
  }
}

