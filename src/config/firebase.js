import admin from "firebase-admin"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Firebase Admin
if (!admin.apps.length) {
  let credential

  // Check if FIREBASE_SERVICE_ACCOUNT environment variable exists (for Vercel deployment)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      // Parse the JSON string from environment variable
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      credential = admin.credential.cert(serviceAccount)
      console.log("✅ Firebase initialized with environment variable")
    } catch (error) {
      console.error("❌ Error parsing FIREBASE_SERVICE_ACCOUNT:", error.message)
      throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT JSON in environment variables")
    }
  } else {
    // Fallback to JSON file for local development
    const serviceAccountPath =
      process.env.SERVICE_ACCOUNT_PATH || path.join(__dirname, "..", "..", "wikkiai-serviceJson.json")

    try {
      credential = admin.credential.cert(serviceAccountPath)
      console.log("✅ Firebase initialized with JSON file")
    } catch (error) {
      console.error("❌ Error loading Firebase service account file:", error.message)
      throw new Error("Firebase service account file not found or invalid")
    }
  }

  admin.initializeApp({
    credential: credential,
  })
}

export default admin

