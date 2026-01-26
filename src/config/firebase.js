import admin from "firebase-admin"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const serviceAccountPath =
  process.env.SERVICE_ACCOUNT_PATH || path.join(__dirname, "..", "..", "wikkiai-serviceJson.json")

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  })
}

export default admin

